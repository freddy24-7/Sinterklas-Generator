'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50" role="banner">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink">
            <span className="text-lg sm:text-xl font-bold text-primary flex-shrink-0" aria-hidden="true">🎁</span>
            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-foreground truncate">Sinterklaas Gedichten</h1>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm flex-shrink-0 whitespace-nowrap shadow-sm"
                aria-label="Toon instructies voor gebruik van de Sinterklaas gedichten generator"
              >
                <span aria-hidden="true">ℹ️</span>
                <span className="sr-only">Info</span>
                <span className="ml-1">Info</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Hoe te gebruiken</DialogTitle>
                <DialogDescription>
                  Leer hoe je de Sinterklaas gedicht generator gebruikt
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">1. Naam ontvanger</h3>
                  <p className="text-sm text-foreground/70">
                    Vul de naam in van de persoon voor wie je het gedicht wilt maken. Dit veld is verplicht.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">2. Feiten over de ontvanger</h3>
                  <p className="text-sm text-foreground/70">
                    Optioneel: Voeg persoonlijke feiten toe die je in het gedicht wilt verwerken, zoals hobby's,
                    interesses, of grappige anekdotes.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">3. Aantal regels</h3>
                  <p className="text-sm text-foreground/70">
                    Kies tussen 4 en 20 regels voor je gedicht. Gebruik de slider om het aantal aan te passen.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">4. Gedicht stijl</h3>
                  <ul className="text-sm text-foreground/70 space-y-1 list-disc list-inside">
                    <li>
                      <strong>Klassiek:</strong> Strikte structuur met groepen van 4 regels en AABB rijmstructuur
                      (bijvoorbeeld 4+4+4 voor 12 regels)
                    </li>
                    <li>
                      <strong>Vrij Stromend:</strong> Variabele regelgroepen (bijvoorbeeld 2+3+7) met flexibele of
                      optionele rijm
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">5. AI Modus</h3>
                  <p className="text-sm text-foreground/70 mb-2">
                    Kies tussen twee modi:
                  </p>
                  <div className="space-y-3 pl-0">
                    <div className="flex items-start gap-2.5">
                      <span className="text-primary font-bold mt-0.5 flex-shrink-0">•</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-foreground">Fully AI:</span>
                        <span className="text-sm text-foreground/70"> Het gedicht wordt gegenereerd zonder menselijke foutjes - perfect en gepolijst.</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-primary font-bold mt-0.5 flex-shrink-0">•</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-foreground">Humanize:</span>
                        <span className="text-sm text-foreground/70">
                          {' '}Het gedicht bevat 2-3 subtiele foutjes die typisch zijn voor de leeftijd en het geslacht van de
                          schrijver. Vul de leeftijd en het geslacht in om een authentiek handgeschreven gevoel te
                          krijgen.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">6. Vriendelijkheid</h3>
                  <p className="text-sm text-foreground/70">
                    Pas de toon aan van je gedicht:
                  </p>
                  <ul className="text-sm text-foreground/70 space-y-1 list-disc list-inside">
                    <li>
                      <strong>Spicy (0-39):</strong> Grappig en scherp met een vleugje humor
                    </li>
                    <li>
                      <strong>Normaal (40-69):</strong> Neutraal en gebalanceerd
                    </li>
                    <li>
                      <strong>Vriendelijk (70-100):</strong> Heel vriendelijk en positief
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">7. Genereer en download</h3>
                  <p className="text-sm text-foreground/70">
                    Klik op "Genereer Gedicht" om je persoonlijke Sinterklaas gedicht te maken. Je kunt het gedicht
                    kopiëren, printen of downloaden als PDF.
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Alle gedichten beginnen met "Madrid, 5 december" en eindigen met "Sint en Piet"
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}

