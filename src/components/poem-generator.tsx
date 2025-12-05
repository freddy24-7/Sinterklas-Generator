'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ControlPanel from './control-panel';
import { useLanguage } from '@/lib/language-context';

export default function PoemGenerator() {
  const [numLines, setNumLines] = useState(8);
  const [isClassic, setIsClassic] = useState(true);
  const [friendliness, setFriendliness] = useState(50);
  const [recipientName, setRecipientName] = useState('');
  const [recipientFacts, setRecipientFacts] = useState('');
  const [isHumanize, setIsHumanize] = useState(false);
  const [authorAge, setAuthorAge] = useState('');
  const [authorGender, setAuthorGender] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [completion, setCompletion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<Error | null>(null);
  const { t, poemLanguage } = useLanguage();
  
  // Ref for abort controller
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean up the poem text (filter problematic content)
  const cleanPoem = useCallback((text: string): string => {
    let cleaned = text
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/^#+\s*/gm, '') // Remove markdown headers
      .trim();

    // Filter out problematic terms
    cleaned = cleaned.replace(/\b[zZ]warte\s+[pP]iet\b/gi, 'Piet');
    cleaned = cleaned.replace(/\bzo\s+zwart\s+als\s+roet\b/gi, '');
    cleaned = cleaned.replace(/\bals\s+roet\b/gi, '');

    // Filter "zwart" from lines containing "Piet"
    const lines = cleaned.split('\n');
    const filteredLines = lines.map((line) => {
      if (/\b[Pp]iet\b/i.test(line)) {
        line = line.replace(/\b[zZ]warte?\b/gi, '');
      }
      return line;
    });
    cleaned = filteredLines.join('\n');

    // Clean up spacing
    cleaned = cleaned.replace(/\s{2,}/g, ' ');
    cleaned = cleaned.replace(/\n\s+/g, '\n');
    cleaned = cleaned.replace(/\s+\n/g, '\n');
    
    return cleaned.trim();
  }, []);

  // The displayed poem with real-time cleaning
  const displayedPoem = completion ? cleanPoem(completion) : '';

  const handleDownloadPDF = async () => {
    if (!displayedPoem) return;

    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    doc.setFont('helvetica');
    doc.setFontSize(12);

    const lines = displayedPoem.split('\n');
    let y = margin + 10;
    const lineHeight = 7;

    lines.forEach((line) => {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }

      if (line.trim() === '') {
        y += lineHeight / 2;
        return;
      }

      const splitLines = doc.splitTextToSize(line, maxWidth);
      splitLines.forEach((splitLine: string) => {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(splitLine, margin, y);
        y += lineHeight;
      });
    });

    const filename = recipientName
      ? `Sinterklaas_Gedicht_${recipientName.replace(/\s+/g, '_')}.pdf`
      : 'Sinterklaas_Gedicht.pdf';

    doc.save(filename);
  };

  const handlePrint = () => {
    if (!displayedPoem) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html lang="nl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Sinterklaas Gedicht${recipientName ? ` - ${recipientName}` : ''}</title>
          <style>
            @media print {
              @page { margin: 2cm; }
              body { margin: 0; padding: 0; }
            }
            body {
              font-family: 'Times New Roman', serif;
              font-size: 14pt;
              line-height: 1.8;
              max-width: 21cm;
              margin: 2cm auto;
              padding: 1cm;
              color: #000;
              background: #fff;
            }
            .poem { white-space: pre-line; text-align: left; }
            .poem p { margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          <div class="poem">${displayedPoem.replace(/\n/g, '<br>')}</div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  const handleGeneratePoem = async () => {
    // Prevent multiple simultaneous requests
    if (isLoading) return;

    // Clear previous state
    setValidationError(null);
    setApiError(null);
    setCompletion('');

    // Validate recipient name
    if (!recipientName || recipientName.trim() === '') {
      setValidationError(t('poemGenerator.errors.noRecipientName'));
      return;
    }

    // Validate humanize fields if humanize is enabled
    if (isHumanize) {
      if (!authorAge || authorAge.trim() === '') {
        setValidationError(t('poemGenerator.errors.noAuthorAge'));
        return;
      }
      if (!authorGender || authorGender.trim() === '') {
        setValidationError(t('poemGenerator.errors.noAuthorGender'));
        return;
      }
    }

    setIsLoading(true);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/generate-poem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: recipientName.trim(),
          recipientFacts: recipientFacts.trim(),
          numLines,
          isClassic,
          friendliness,
          isHumanize,
          authorAge: isHumanize ? authorAge.trim() : '',
          authorGender: isHumanize ? authorGender.trim() : '',
          poemLanguage,
        }),
        signal: abortControllerRef.current.signal,
      });

      // Check for errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      // Check if fallback was used and notify user
      const fallbackUsed = response.headers.get('X-Fallback-Used');
      const fallbackReason = response.headers.get('X-Fallback-Reason');
      const modelUsed = response.headers.get('X-Model-Used');

      if (fallbackUsed === 'true') {
        // Show info toast about fallback
        const message = modelUsed === 'direct-gemini'
          ? '⚡ Gratis modellen waren druk, backup model gebruikt'
          : '⚡ Even gewisseld naar een ander model';

        toast.info(message, {
          description: fallbackReason || 'Druk op servers, maar gedicht komt eraan!',
          duration: 4000,
        });
      }

      // Stream the response chunk by chunk
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let fullText = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setCompletion(fullText);
      }
      
      // Show success toast when complete
      toast.success('Gedicht gegenereerd! 🎉', {
        duration: 2000,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, ignore
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      setApiError(error instanceof Error ? error : new Error(errorMessage));

      // Show error toast
      toast.error('Er ging iets mis', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Combined error from validation or API
  const error = validationError || (apiError ? apiError.message : null);

  return (
    <div className="max-w-6xl mx-auto w-full overflow-x-hidden px-2 sm:px-0 min-w-0">
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full min-w-0">
        {/* Control Panel */}
        <div className="lg:col-span-1">
          <ControlPanel
            numLines={numLines}
            onNumLinesChange={setNumLines}
            isClassic={isClassic}
            onStyleToggle={setIsClassic}
            friendliness={friendliness}
            onFriendlinessChange={setFriendliness}
            recipientName={recipientName}
            onRecipientNameChange={setRecipientName}
            recipientFacts={recipientFacts}
            onRecipientFactsChange={setRecipientFacts}
            isHumanize={isHumanize}
            onHumanizeToggle={setIsHumanize}
            authorAge={authorAge}
            onAuthorAgeChange={setAuthorAge}
            authorGender={authorGender}
            onAuthorGenderChange={setAuthorGender}
            isLoading={isLoading}
            onGeneratePoem={handleGeneratePoem}
          />
        </div>

        {/* Generated Poem Display */}
        <div className="lg:col-span-2">
          <Card className="p-4 sm:p-6 lg:p-8 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] bg-card border shadow-sm">
            {displayedPoem && (
              <div className="flex flex-wrap gap-2 mb-6 justify-end print:hidden" role="toolbar" aria-label={t('poemGenerator.actions.copy')}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(displayedPoem)}
                  className="text-xs sm:text-sm flex-shrink-0"
                  aria-label={t('poemGenerator.actions.ariaLabels.copy')}
                  disabled={isLoading}
                >
                  <span aria-hidden="true">📋</span>
                  <span className="ml-1">{t('poemGenerator.actions.copy')}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="text-xs sm:text-sm flex-shrink-0"
                  aria-label={t('poemGenerator.actions.ariaLabels.print')}
                  disabled={isLoading}
                >
                  <span aria-hidden="true">🖨️</span>
                  <span className="ml-1">{t('poemGenerator.actions.print')}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="text-xs sm:text-sm flex-shrink-0"
                  aria-label={t('poemGenerator.actions.ariaLabels.pdf')}
                  disabled={isLoading}
                >
                  <span aria-hidden="true">📄</span>
                  <span className="ml-1">{t('poemGenerator.actions.pdf')}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCompletion('');
                    setValidationError(null);
                  }}
                  className="text-xs sm:text-sm flex-shrink-0"
                  aria-label={t('poemGenerator.actions.ariaLabels.clear')}
                  disabled={isLoading}
                >
                  <span aria-hidden="true">🔄</span>
                  <span className="ml-1">{t('poemGenerator.actions.clear')}</span>
                </Button>
              </div>
            )}

            {/* Error Message */}
            {error && !isLoading && (
              <div
                className="mb-4 sm:mb-6 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-lg"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
              >
                <p className="text-xs sm:text-sm text-destructive font-medium break-words">{error}</p>
              </div>
            )}

            {/* Loading State with Streaming */}
            {isLoading && !displayedPoem && (
              <div
                className="flex items-center justify-center h-full min-h-[300px] sm:min-h-[400px] text-center px-4"
                role="status"
                aria-live="polite"
                aria-label={t('poemGenerator.loading.title')}
              >
                <div className="space-y-4">
                  <div className="text-3xl sm:text-4xl animate-pulse" aria-hidden="true">⏳</div>
                  <p className="text-base sm:text-lg lg:text-xl text-foreground/80 font-medium">
                    {t('poemGenerator.loading.title')}
                  </p>
                  <p className="text-xs sm:text-sm text-foreground/70">
                    {t('poemGenerator.loading.subtitle')}
                  </p>
                </div>
              </div>
            )}

            {/* Generated Poem (streams word by word) */}
            {displayedPoem && (
              <div 
                className="space-y-4 max-h-[500px] overflow-y-auto" 
                role="region" 
                aria-label="Gegenereerd gedicht"
              >
                <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                  <div
                    className="text-foreground whitespace-pre-line leading-relaxed font-serif text-sm sm:text-base lg:text-lg xl:text-xl break-words"
                    role="article"
                    aria-live="polite"
                    aria-atomic="false"
                  >
                    {displayedPoem}
                    {/* Streaming cursor indicator */}
                    {isLoading && (
                      <span className="inline-block w-2 h-5 bg-primary/60 animate-pulse ml-1 align-text-bottom" aria-hidden="true" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !displayedPoem && !error && (
              <div className="flex items-center justify-center h-full min-h-[300px] sm:min-h-[400px] text-center px-4">
                <div className="space-y-3 max-w-sm">
                  <div className="text-3xl sm:text-4xl mb-4">✨</div>
                  <p className="text-base sm:text-lg lg:text-xl text-foreground/80 font-medium">
                    {t('poemGenerator.empty.title')}
                  </p>
                  <p className="text-xs sm:text-sm text-foreground/70">
                    {t('poemGenerator.empty.description')}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
