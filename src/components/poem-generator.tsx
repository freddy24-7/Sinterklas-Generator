'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ControlPanel from './control-panel';

export default function PoemGenerator() {
  const [numLines, setNumLines] = useState(8);
  const [isClassic, setIsClassic] = useState(true);
  const [friendliness, setFriendliness] = useState(50);
  const [recipientName, setRecipientName] = useState('');
  const [recipientFacts, setRecipientFacts] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPoem, setGeneratedPoem] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePoem = async () => {
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
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
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
          <Card className="p-6 sm:p-8 min-h-[500px] sm:min-h-[600px] bg-card border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Je Gedicht</h2>
              {generatedPoem && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPoem);
                      // Optional: Show a toast notification
                    }}
                    className="text-xs sm:text-sm"
                  >
                    📋 Kopiëren
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setGeneratedPoem('');
                      setError(null);
                    }}
                    className="text-xs sm:text-sm"
                  >
                    🔄 Wissen
                  </Button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center h-full min-h-[400px] text-center">
                <div className="space-y-4">
                  <div className="text-4xl animate-pulse">⏳</div>
                  <p className="text-lg sm:text-xl text-foreground/80 font-medium">
                    Gedicht wordt gegenereerd...
                  </p>
                  <p className="text-sm sm:text-base text-foreground/50">
                    Dit kan even duren
                  </p>
                </div>
              </div>
            )}

            {/* Generated Poem */}
            {!isLoading && generatedPoem && (
              <div className="space-y-6">
                <div className="prose prose-lg max-w-none">
                  <p className="text-foreground whitespace-pre-line leading-relaxed font-serif text-base sm:text-lg lg:text-xl">
                    {generatedPoem}
                  </p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !generatedPoem && !error && (
              <div className="flex items-center justify-center h-full min-h-[400px] text-center">
                <div className="space-y-3 max-w-sm">
                  <div className="text-4xl mb-4">✨</div>
                  <p className="text-lg sm:text-xl text-foreground/80 font-medium">
                    Nog niets gegenereerd
                  </p>
                  <p className="text-sm sm:text-base text-foreground/50">
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
