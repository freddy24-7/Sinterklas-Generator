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
import { useLanguage } from '@/lib/language-context';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage, poemLanguage, setPoemLanguage, t } = useLanguage();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50" role="banner">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink">
            <span className="text-lg sm:text-xl font-bold text-primary flex-shrink-0" aria-hidden="true">🎁</span>
            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-foreground truncate">{t('header.title')}</h1>
          </div>

          {/* Language Selectors - Hidden on mobile, visible on larger screens */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* UI Language Selector */}
            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
              <label className="text-[10px] sm:text-xs text-foreground/70 whitespace-nowrap">{t('language.infoLabel')}</label>
              <div className="flex gap-0.5 sm:gap-1 bg-muted/50 border border-border rounded-md p-0.5 sm:p-1">
                <button
                  onClick={() => setLanguage('nl')}
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded transition-colors ${
                    language === 'nl'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  aria-label={`${t('language.infoLabel')} ${t('language.dutch')}`}
                >
                  NL
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded transition-colors ${
                    language === 'en'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  aria-label={`${t('language.infoLabel')} ${t('language.english')}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('ar')}
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded transition-colors ${
                    language === 'ar'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  aria-label={`${t('language.infoLabel')} ${t('language.moroccan')}`}
                >
                  AR
                </button>
                <button
                  onClick={() => setLanguage('tr')}
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded transition-colors ${
                    language === 'tr'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  aria-label={`${t('language.infoLabel')} ${t('language.turkish')}`}
                >
                  TR
                </button>
              </div>
            </div>

            {/* Poem Language Selector */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <label className="text-[10px] sm:text-xs text-foreground/70 whitespace-nowrap">{t('language.poemLabel')}</label>
              <div className="flex gap-0.5 sm:gap-1 bg-muted/50 border border-border rounded-md p-0.5 sm:p-1">
                <button
                  onClick={() => setPoemLanguage('nl')}
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded transition-colors ${
                    poemLanguage === 'nl'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  aria-label={`${t('language.poemLabel')} ${t('language.dutch')}`}
                >
                  NL
                </button>
                <button
                  onClick={() => setPoemLanguage('en')}
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded transition-colors ${
                    poemLanguage === 'en'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  aria-label={`${t('language.poemLabel')} ${t('language.english')}`}
                >
                  EN
                </button>
                <button
                  onClick={() => setPoemLanguage('ar')}
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded transition-colors ${
                    poemLanguage === 'ar'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  aria-label={`${t('language.poemLabel')} ${t('language.moroccan')}`}
                >
                  AR
                </button>
                <button
                  onClick={() => setPoemLanguage('tr')}
                  className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs rounded transition-colors ${
                    poemLanguage === 'tr'
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  aria-label={`${t('language.poemLabel')} ${t('language.turkish')}`}
                >
                  TR
                </button>
              </div>
            </div>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm flex-shrink-0 whitespace-nowrap shadow-sm"
                aria-label={t('header.infoAriaLabel')}
              >
                <span aria-hidden="true">ℹ️</span>
                <span className="sr-only">{t('header.infoButton')}</span>
                <span className="ml-1">{t('header.infoButton')}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] sm:max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('header.instructions.title')}</DialogTitle>
                <DialogDescription>
                  {t('header.instructions.description')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{t('header.instructions.sections.language.title')}</h3>
                  <p className="text-sm text-foreground/70 mb-2">
                    {t('header.instructions.sections.language.infoText')}
                  </p>
                  <div className="space-y-2 pl-0">
                    <div className="flex items-start gap-2.5">
                      <span className="text-primary font-bold mt-0.5 flex-shrink-0">•</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground/70">
                          {t('header.instructions.sections.language.infoDescription')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-primary font-bold mt-0.5 flex-shrink-0">•</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground/70">
                          {t('header.instructions.sections.language.poemDescription')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{t('header.instructions.sections.recipientName.title')}</h3>
                  <p className="text-sm text-foreground/70">
                    {t('header.instructions.sections.recipientName.text')}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{t('header.instructions.sections.recipientFacts.title')}</h3>
                  <p className="text-sm text-foreground/70">
                    {t('header.instructions.sections.recipientFacts.text')}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{t('header.instructions.sections.numLines.title')}</h3>
                  <p className="text-sm text-foreground/70">
                    {t('header.instructions.sections.numLines.text')}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{t('header.instructions.sections.style.title')}</h3>
                  <ul className="text-sm text-foreground/70 space-y-1 list-disc list-inside">
                    <li>
                      <strong>{t('controlPanel.style.classic.label')}:</strong> {t('header.instructions.sections.style.classic')}
                    </li>
                    <li>
                      <strong>{t('controlPanel.style.free.label')}:</strong> {t('header.instructions.sections.style.free')}
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{t('header.instructions.sections.aiMode.title')}</h3>
                  <p className="text-sm text-foreground/70 mb-2">
                    {t('header.instructions.sections.aiMode.intro')}
                  </p>
                  <div className="space-y-3 pl-0">
                    <div className="flex items-start gap-2.5">
                      <span className="text-primary font-bold mt-0.5 flex-shrink-0">•</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-foreground">{t('controlPanel.aiMode.fullyAi.label')}:</span>
                        <span className="text-sm text-foreground/70"> {t('header.instructions.sections.aiMode.fullyAi')}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-primary font-bold mt-0.5 flex-shrink-0">•</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-foreground">{t('controlPanel.aiMode.humanize.label')}:</span>
                        <span className="text-sm text-foreground/70">
                          {' '}{t('header.instructions.sections.aiMode.humanize')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{t('header.instructions.sections.friendliness.title')}</h3>
                  <p className="text-sm text-foreground/70">
                    {t('header.instructions.sections.friendliness.intro')}
                  </p>
                  <ul className="text-sm text-foreground/70 space-y-1 list-disc list-inside">
                    <li>
                      <strong>{t('header.instructions.sections.friendliness.spicy')}</strong>
                    </li>
                    <li>
                      <strong>{t('header.instructions.sections.friendliness.normal')}</strong>
                    </li>
                    <li>
                      <strong>{t('header.instructions.sections.friendliness.friendly')}</strong>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{t('header.instructions.sections.generate.title')}</h3>
                  <p className="text-sm text-foreground/70">
                    {t('header.instructions.sections.generate.text')}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">{t('header.instructions.sections.feedback.title')}</h3>
                  <p className="text-sm text-foreground/70">
                    {t('header.instructions.sections.feedback.text')}
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    {t('header.instructions.tip')}
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

