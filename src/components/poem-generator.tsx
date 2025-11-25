'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ControlPanel from './control-panel';
import jsPDF from 'jspdf';

export default function PoemGenerator() {
  const [numLines, setNumLines] = useState(8);
  const [isClassic, setIsClassic] = useState(true);
  const [friendliness, setFriendliness] = useState(50);
  const [recipientName, setRecipientName] = useState('');
  const [recipientFacts, setRecipientFacts] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPoem, setGeneratedPoem] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDownloadPDF = () => {
    if (!generatedPoem) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    // Set font
    doc.setFont('helvetica');
    doc.setFontSize(12);

    // Split poem into lines
    const lines = generatedPoem.split('\n');
    let y = margin + 10;
    const lineHeight = 7;

    lines.forEach((line) => {
      // Check if we need a new page
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }

      // Handle empty lines
      if (line.trim() === '') {
        y += lineHeight / 2;
        return;
      }

      // Split long lines if needed
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

    // Generate filename with recipient name if available
    const filename = recipientName
      ? `Sinterklaas_Gedicht_${recipientName.replace(/\s+/g, '_')}.pdf`
      : 'Sinterklaas_Gedicht.pdf';

    doc.save(filename);
  };

  const handleGeneratePoem = async () => {
    // Prevent multiple simultaneous requests (429 protection)
    if (isLoading) {
      return;
    }

    // Validate recipient name
    if (!recipientName || recipientName.trim() === '') {
      setError('Vul alsjeblieft de naam van de ontvanger in');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedPoem('');

    try {
      const response = await fetch('/api/generate-poem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientName: recipientName.trim(),
          recipientFacts: recipientFacts.trim(),
          numLines,
          isClassic,
          friendliness,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle 429 rate limit errors specifically
        if (response.status === 429) {
          throw new Error('Te veel verzoeken. Wacht even en probeer het opnieuw.');
        }
        throw new Error(data.error || 'Er is een fout opgetreden');
      }

      if (data.poem) {
        setGeneratedPoem(data.poem);
      } else {
        throw new Error('Geen gedicht ontvangen van de server');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Er is een onbekende fout opgetreden';
      setError(errorMessage);
      console.error('Error generating poem:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full overflow-x-hidden px-2 sm:px-0">
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Control Panel - Takes 1 column on large screens */}
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
            isLoading={isLoading}
            onGeneratePoem={handleGeneratePoem}
          />
        </div>

        {/* Generated Poem Display - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <Card className="p-4 sm:p-6 lg:p-8 min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] bg-card border shadow-sm">
            {generatedPoem && (
              <div className="flex flex-wrap gap-2 mb-6 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPoem);
                  }}
                  className="text-xs sm:text-sm flex-shrink-0"
                >
                  📋 Kopiëren
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  className="text-xs sm:text-sm flex-shrink-0"
                >
                  📄 PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setGeneratedPoem('');
                    setError(null);
                  }}
                  className="text-xs sm:text-sm flex-shrink-0"
                >
                  🔄 Wissen
                </Button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-xs sm:text-sm text-destructive font-medium break-words">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center h-full min-h-[300px] sm:min-h-[400px] text-center px-4">
                <div className="space-y-4">
                  <div className="text-3xl sm:text-4xl animate-pulse">⏳</div>
                  <p className="text-base sm:text-lg lg:text-xl text-foreground/80 font-medium">
                    Gedicht wordt gegenereerd...
                  </p>
                  <p className="text-xs sm:text-sm text-foreground/50">
                    Dit kan even duren
                  </p>
                </div>
              </div>
            )}

            {/* Generated Poem */}
            {!isLoading && generatedPoem && (
              <div className="space-y-4">
                <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                  <p className="text-foreground whitespace-pre-line leading-relaxed font-serif text-sm sm:text-base lg:text-lg xl:text-xl break-words">
                    {generatedPoem}
                  </p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !generatedPoem && !error && (
              <div className="flex items-center justify-center h-full min-h-[300px] sm:min-h-[400px] text-center px-4">
                <div className="space-y-3 max-w-sm">
                  <div className="text-3xl sm:text-4xl mb-4">✨</div>
                  <p className="text-base sm:text-lg lg:text-xl text-foreground/80 font-medium">
                    Nog niets gegenereerd
                  </p>
                  <p className="text-xs sm:text-sm text-foreground/50">
                    Vul de naam van de ontvanger in en klik op "Genereer Gedicht" om te beginnen
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
