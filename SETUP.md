# Setup Guide

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
# Required: OpenRouter API Key (get yours free at https://openrouter.ai/keys)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional: Choose your AI model (defaults to free Gemini 2.0 Flash)
AI_MODEL=gemini-2.0-flash-free

# Optional: Your site URL (for OpenRouter analytics)
SITE_URL=https://www.sinterklaas-poem.nl
```

### Available AI Models

The application uses [OpenRouter](https://openrouter.ai) for AI model access, giving you access to 100+ models through a single API. Here are the pre-configured options:

#### Free Tier Models (Great for Development)
| Model Key | Provider | Description |
|-----------|----------|-------------|
| `gemini-2.0-flash-free` | Google | Fast and capable, **default** |
| `gemini-flash-free` | Google | Lightweight and fast |
| `llama-3.1-8b` | Meta | Open source, good quality |

#### Affordable Models
| Model Key | Provider | Description |
|-----------|----------|-------------|
| `gemini-2.0-flash` | Google | Fast, slightly better than free |
| `gemini-1.5-flash` | Google | Good balance of speed/quality |
| `gpt-4o-mini` | OpenAI | Fast and affordable |
| `claude-3-haiku` | Anthropic | Quick and efficient |

#### Premium Models (Best Quality)
| Model Key | Provider | Description |
|-----------|----------|-------------|
| `gpt-4o` | OpenAI | Excellent quality |
| `claude-3.5-sonnet` | Anthropic | Top tier for creative writing |
| `gemini-1.5-pro` | Google | High quality, longer context |

To use a different model, set `AI_MODEL` in your `.env.local`:

```env
AI_MODEL=claude-3.5-sonnet
```

## Getting Your OpenRouter API Key

1. Go to [OpenRouter](https://openrouter.ai/keys)
2. Sign up or sign in (GitHub, Google, or email)
3. Click "Create Key"
4. Copy the API key
5. Add it to your `.env.local` file

**Note:** OpenRouter offers free credits for new accounts and has several free models available!

## Migration from Google Gemini Direct API

If you were previously using the Google Generative AI API directly, you'll need to:

1. Sign up for an OpenRouter account (free)
2. Replace your `GOOGLE_GENERATIVE_AI_API_KEY` with `OPENROUTER_API_KEY`
3. (Optional) Set `AI_MODEL` to your preferred model

The old environment variables (`GOOGLE_GENERATIVE_AI_API_KEY`, `GEMINI_API_KEY`, etc.) are no longer used.

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file with your API key (see above)

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

### Streaming Responses
Poems now appear word-by-word as they're generated, providing a much better user experience with visual feedback during generation.

### Model Flexibility
Easily switch between different AI models without code changes - just update your environment variable.

### Automatic Model Fallback (Free Models)
When using free models, the app automatically tries multiple models if one is rate limited:

1. **Primary:** Gemini 2.0 Flash (free via OpenRouter)
2. **Fallback 1:** Llama 3.1 8B (free via OpenRouter)
3. **Fallback 2:** Gemini Flash 1.5 (free via OpenRouter)
4. **Final Fallback:** Direct Gemini API (uses your own quota) - *optional*

This means users rarely see rate limit errors - the app transparently switches to an available model.

#### Enabling the Direct Gemini Fallback

If you want to ensure poems always generate (even when all free models are busy), add your Google API key:

```env
# Optional: Direct Gemini API as final fallback (uses your quota)
GEMINI_API_KEY=your_google_api_key_here
```

Get your key at [Google AI Studio](https://makersuite.google.com/app/apikey). This is only used when all free OpenRouter models are rate limited.

## Usage

1. Fill in the recipient's name (required)
2. Optionally add facts about the recipient
3. Adjust the settings:
   - Number of lines (4-20)
   - Style (Classic or Free-flowing)
   - Friendliness level (0-100)
   - Humanize mode (optional)
4. Click "Genereer Gedicht" to generate the poem
5. Watch the poem stream in real-time!
6. Copy, print, download as PDF, or clear the generated poem

## Troubleshooting

### API Key Issues
- Make sure your `.env.local` file is in the root directory
- Restart the development server after adding/changing environment variables
- Verify your API key is correct at [OpenRouter Keys](https://openrouter.ai/keys)

### Generation Errors
- Check the browser console for error messages
- Ensure you have internet connectivity
- Verify your OpenRouter account has sufficient credits
- Try switching to a free model: `AI_MODEL=gemini-2.0-flash-free`

### Rate Limiting
The app has two layers of rate limiting:

1. **User Rate Limiting (Vercel KV):** Limits requests per IP address to prevent abuse
2. **AI Provider Fallback:** Automatically switches models when a provider is rate limited

#### User Rate Limits
By default, users are limited to:
- **5 poems per minute**
- **30 poems per hour**
- **100 poems per day**

These limits can be adjusted in `src/lib/rate-limiter.ts`.

## Vercel KV Setup (Rate Limiting Storage)

Rate limiting uses [Vercel KV](https://vercel.com/storage/kv) to persist counters across serverless instances. **Free tier includes 30,000 requests/month** - more than enough for most use cases.

### Setting Up Vercel KV

1. Go to your Vercel project dashboard
2. Click on "Storage" tab
3. Click "Create" → "KV Database"
4. Name it (e.g., `sinterklaas-ratelimit`)
5. Click "Create"
6. Connect it to your project

Vercel automatically adds these environment variables:
```env
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token
KV_REST_API_READ_ONLY_TOKEN=your_read_only_token
KV_URL=your_kv_redis_url
```

### Local Development without KV

If `KV_REST_API_URL` is not set, rate limiting is **disabled** and a warning is logged. This is fine for local development.

To test rate limiting locally:
1. Create a KV database on Vercel
2. Copy the environment variables to your `.env.local`

### Rate Limit Response Headers

The API returns rate limit information in response headers:
- `X-RateLimit-Limit-Minute`: Max requests per minute
- `X-RateLimit-Limit-Hour`: Max requests per hour
- `X-RateLimit-Limit-Day`: Max requests per day
- `X-RateLimit-Remaining-*`: Remaining requests in each window

## Vercel Deployment

When deploying to Vercel:

### 1. Set Up Environment Variables
1. Go to your project settings
2. Navigate to Environment Variables
3. Add `OPENROUTER_API_KEY` with your API key
4. (Optional) Add `AI_MODEL` if you want a non-default model
5. (Optional) Add `SITE_URL` with your production URL
6. (Optional) Add `GEMINI_API_KEY` for direct Gemini fallback

### 2. Set Up Vercel KV (Recommended)
1. In your Vercel dashboard, go to "Storage"
2. Create a new KV database
3. Connect it to your project
4. Environment variables are automatically added

Without Vercel KV, rate limiting is disabled and any user can generate unlimited poems (which could burn through your API credits quickly).
