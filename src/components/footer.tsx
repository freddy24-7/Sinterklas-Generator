export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mt-auto" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-center sm:text-left">
            <p className="text-xs sm:text-sm text-foreground/70">
              Genereer persoonlijke Sinterklaas gedichten
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              © {currentYear} Sinterklaas Gedichten Generator
            </p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
            <span aria-hidden="true">🎅</span>
            <span className="whitespace-nowrap">
              Met <span aria-hidden="true">❤️</span> gemaakt voor Sinterklaas
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

