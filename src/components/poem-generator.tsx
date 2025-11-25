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

  const handleGeneratePoem = async () => {
    setIsLoading(true);
    // Placeholder for actual poem generation logic
    setTimeout(() => {
      const styles = isClassic ? 'klassieke' : 'vrije';
      const tone = friendliness > 70 ? 'vriendelijk' : friendliness > 40 ? 'neutraal' : 'scherp';
      const nameText = recipientName ? ` voor ${recipientName}` : '';
      const factsText = recipientFacts ? `\n\nFeiten: ${recipientFacts}` : '';
      setGeneratedPoem(
        `Een ${styles} ${tone} Sinterklaas gedicht${nameText} met ${numLines} regels:\n\n` +
          `Dit is een gegenereerd gedicht dat ${numLines} regels bevat.\n` +
          `De toon is ${tone} en de stijl is ${styles}.\n` +
          `Met vriendelijkheid niveau: ${friendliness}/100.${factsText}\n\n` +
          'Hier zouden je gegenereerde regels verschijnen...',
      );
      setIsLoading(false);
    }, 1500);
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
                    onClick={() => navigator.clipboard.writeText(generatedPoem)}
                    className="text-xs sm:text-sm"
                  >
                    📋 Kopiëren
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGeneratedPoem('')}
                    className="text-xs sm:text-sm"
                  >
                    🔄 Wissen
                  </Button>
                </div>
              )}
            </div>
            {generatedPoem ? (
              <div className="space-y-6">
                <div className="prose prose-lg max-w-none">
                  <p className="text-foreground whitespace-pre-line leading-relaxed font-serif text-base sm:text-lg lg:text-xl">
                    {generatedPoem}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] text-center">
                <div className="space-y-3 max-w-sm">
                  <div className="text-4xl mb-4">✨</div>
                  <p className="text-lg sm:text-xl text-foreground/80 font-medium">
                    Nog niets gegenereerd
                  </p>
                  <p className="text-sm sm:text-base text-foreground/50">
                    Pas je instellingen aan en klik op "Genereer Gedicht" om te beginnen
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
