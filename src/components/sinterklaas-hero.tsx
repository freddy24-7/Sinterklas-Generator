'use client';

export default function SinterklaasHero() {
  return (
    <div className="text-center mb-12 sm:mb-16 lg:mb-20">
      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
        <span aria-hidden="true">🎁</span>
        <span>Welkom bij het Sinterklaas Feest</span>
      </div>
      
      {/* Sinterklaas Illustration */}
      <div className="flex justify-center mb-6 sm:mb-8 px-4">
        <div className="relative w-full max-w-[192px] sm:max-w-[224px] lg:max-w-[256px] aspect-square">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl blur-3xl" aria-hidden="true"></div>
          <div className="relative bg-card border border-border rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg overflow-hidden w-full h-full">
            <svg 
              viewBox="0 0 200 300" 
              className="w-full h-full text-primary" 
              fill="currentColor" 
              preserveAspectRatio="xMidYMid meet"
              aria-label="Illustratie van Sinterklaas"
              role="img"
            >
              {/* Hat */}
              <ellipse cx="100" cy="50" rx="45" ry="20" fill="#c41e3a" />
              <polygon points="100,50 70,80 130,80" fill="#c41e3a" />
              <circle cx="100" cy="48" r="8" fill="white" />

              {/* Face */}
              <circle cx="100" cy="120" r="35" fill="#fdbcb4" />

              {/* Eyes */}
              <circle cx="90" cy="110" r="4" fill="#1a1a1a" />
              <circle cx="110" cy="110" r="4" fill="#1a1a1a" />

              {/* Nose */}
              <ellipse cx="100" cy="125" rx="3" ry="5" fill="#fca89a" />

              {/* Beard */}
              <path d="M 75 130 Q 100 160 125 130" fill="white" opacity="0.9" />
              <ellipse cx="100" cy="150" rx="30" ry="20" fill="white" opacity="0.85" />

              {/* Smile */}
              <path d="M 90 135 Q 100 142 110 135" stroke="#1a1a1a" strokeWidth="2" fill="none" />

              {/* Robe */}
              <path d="M 70 155 L 60 280 Q 100 290 140 280 L 130 155" fill="#c41e3a" />

              {/* Gold trim */}
              <rect x="65" y="155" width="70" height="8" fill="#d4a574" />
              <circle cx="75" cy="180" r="3" fill="#d4a574" />
              <circle cx="100" cy="185" r="3" fill="#d4a574" />
              <circle cx="125" cy="178" r="3" fill="#d4a574" />

              {/* Staff */}
              <rect x="130" y="100" width="6" height="100" fill="#8B4513" />
              <circle cx="133" cy="95" r="8" fill="#d4a574" />
            </svg>
          </div>
        </div>
      </div>

      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
        <span className="text-foreground">Sinterklaas </span>
        <span className="text-primary">Gedichten</span>
      </h1>
      <p className="text-base sm:text-lg lg:text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed px-4">
        Genereer persoonlijke en grappige Sinterklaas gedichten voor je vrienden en familie. Kies je stijl en bepaal de
        vriendelijkheid.
      </p>
    </div>
  );
}
