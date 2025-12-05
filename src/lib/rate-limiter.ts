import { kv } from '@vercel/kv';

export type RateLimitConfig = {
  perMinute: number;
  perHour: number;
  perDay: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: {
    minute: number;
    hour: number;
    day: number;
  };
  resetIn: {
    minute: number; // seconds until minute resets
    hour: number;   // seconds until hour resets
    day: number;    // seconds until day resets
  };
};

// Default limits for poem generation
export const DEFAULT_LIMITS: RateLimitConfig = {
  perMinute: 5,   // 5 poems per minute
  perHour: 30,    // 30 poems per hour
  perDay: 100,    // 100 poems per day
};

/**
 * Check rate limit for a given IP address
 * Uses Vercel KV for persistent storage across serverless instances
 */
export async function checkRateLimit(
  ip: string,
  config: RateLimitConfig = DEFAULT_LIMITS
): Promise<RateLimitResult> {
  // If KV is not configured, allow all requests (development fallback)
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.warn('⚠️ Vercel KV not configured - rate limiting disabled');
    return {
      allowed: true,
      remaining: { minute: config.perMinute, hour: config.perHour, day: config.perDay },
      resetIn: { minute: 60, hour: 3600, day: 86400 },
    };
  }

  const now = Date.now();
  const currentMinute = Math.floor(now / 60000);
  const currentHour = Math.floor(now / 3600000);
  const currentDay = Math.floor(now / 86400000);

  // Create unique keys for each time window
  const keys = {
    minute: `rate:poem:${ip}:min:${currentMinute}`,
    hour: `rate:poem:${ip}:hour:${currentHour}`,
    day: `rate:poem:${ip}:day:${currentDay}`,
  };

  try {
    // Get current counts for all windows
    const [minuteCount, hourCount, dayCount] = await Promise.all([
      kv.get<number>(keys.minute),
      kv.get<number>(keys.hour),
      kv.get<number>(keys.day),
    ]);

    const counts = {
      minute: minuteCount ?? 0,
      hour: hourCount ?? 0,
      day: dayCount ?? 0,
    };

    // Calculate time until each window resets
    const resetIn = {
      minute: 60 - Math.floor((now % 60000) / 1000),
      hour: 3600 - Math.floor((now % 3600000) / 1000),
      day: 86400 - Math.floor((now % 86400000) / 1000),
    };

    // Check if any limit is exceeded
    const limitExceeded = 
      counts.minute >= config.perMinute ||
      counts.hour >= config.perHour ||
      counts.day >= config.perDay;

    if (limitExceeded) {
      // Determine which limit was hit for logging
      let limitType = 'unknown';
      if (counts.minute >= config.perMinute) limitType = 'minute';
      else if (counts.hour >= config.perHour) limitType = 'hour';
      else if (counts.day >= config.perDay) limitType = 'day';
      
      console.log(`🚫 Rate limit exceeded for ${ip} (${limitType} limit)`);
      
      return {
        allowed: false,
        remaining: {
          minute: Math.max(0, config.perMinute - counts.minute),
          hour: Math.max(0, config.perHour - counts.hour),
          day: Math.max(0, config.perDay - counts.day),
        },
        resetIn,
      };
    }

    // Increment all counters with appropriate TTLs
    // Using pipeline for efficiency
    await Promise.all([
      kv.incr(keys.minute).then(() => kv.expire(keys.minute, 120)), // 2 min TTL for safety
      kv.incr(keys.hour).then(() => kv.expire(keys.hour, 7200)),    // 2 hour TTL
      kv.incr(keys.day).then(() => kv.expire(keys.day, 172800)),    // 2 day TTL
    ]);

    return {
      allowed: true,
      remaining: {
        minute: config.perMinute - counts.minute - 1,
        hour: config.perHour - counts.hour - 1,
        day: config.perDay - counts.day - 1,
      },
      resetIn,
    };
  } catch (error) {
    // If KV fails, log error but allow the request (fail open)
    console.error('Rate limiter error:', error);
    return {
      allowed: true,
      remaining: { minute: config.perMinute, hour: config.perHour, day: config.perDay },
      resetIn: { minute: 60, hour: 3600, day: 86400 },
    };
  }
}

/**
 * Get the client IP address from the request
 */
export function getClientIP(request: Request): string {
  // Try various headers in order of preference
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs; the first one is the client
    return forwardedFor.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP.trim();
  }

  // Vercel-specific header
  const vercelIP = request.headers.get('x-vercel-forwarded-for');
  if (vercelIP) {
    return vercelIP.split(',')[0].trim();
  }

  // Fallback for development
  return '127.0.0.1';
}

/**
 * Format rate limit error message for the user
 */
export function formatRateLimitMessage(
  result: RateLimitResult,
  language: string = 'nl'
): string {
  const messages: Record<string, Record<string, string>> = {
    nl: {
      minute: `Je hebt te veel gedichten gegenereerd. Probeer het over ${result.resetIn.minute} seconden opnieuw.`,
      hour: `Je hebt het uurlimiet bereikt. Probeer het over ${Math.ceil(result.resetIn.hour / 60)} minuten opnieuw.`,
      day: `Je hebt het daglimiet bereikt. Probeer het morgen opnieuw.`,
    },
    en: {
      minute: `Too many requests. Please try again in ${result.resetIn.minute} seconds.`,
      hour: `Hourly limit reached. Please try again in ${Math.ceil(result.resetIn.hour / 60)} minutes.`,
      day: `Daily limit reached. Please try again tomorrow.`,
    },
  };

  const lang = messages[language] || messages.nl;

  // Determine which limit was hit
  if (result.remaining.minute <= 0) return lang.minute;
  if (result.remaining.hour <= 0) return lang.hour;
  if (result.remaining.day <= 0) return lang.day;

  return lang.minute; // Default
}

