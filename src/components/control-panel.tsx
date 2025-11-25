'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

interface ControlPanelProps {
  numLines: number;
  onNumLinesChange: (value: number) => void;
  isClassic: boolean;
  onStyleToggle: (value: boolean) => void;
  friendliness: number;
  onFriendlinessChange: (value: number) => void;
  recipientName: string;
  onRecipientNameChange: (value: string) => void;
  recipientFacts: string;
  onRecipientFactsChange: (value: string) => void;
  isLoading: boolean;
  onGeneratePoem: () => void;
}

export default function ControlPanel({
  numLines,
  onNumLinesChange,
  isClassic,
  onStyleToggle,
  friendliness,
  onFriendlinessChange,
  recipientName,
  onRecipientNameChange,
  recipientFacts,
  onRecipientFactsChange,
  isLoading,
  onGeneratePoem,
}: ControlPanelProps) {
  const getFriendlinessLabel = () => {
    if (friendliness === 0) return 'Spicy 🌶️';
    if (friendliness < 40) return 'Grappig 😄';
    if (friendliness < 70) return 'Normaal 😊';
    return 'Heel Vriendelijk 🥰';
  };

  return (
    <Card className="p-5 sm:p-6 bg-card border shadow-sm sticky top-6">
      <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-6">Instellingen</h2>

      <div className="space-y-6">
        {/* Recipient Name */}
        <div className="space-y-2">
          <label htmlFor="recipient-name" className="text-sm font-medium text-foreground">
            Naam ontvanger
          </label>
          <input
            id="recipient-name"
            type="text"
            value={recipientName}
            onChange={(e) => onRecipientNameChange(e.target.value)}
            placeholder="Bijv. Jan"
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        {/* Recipient Facts */}
        <div className="space-y-2">
          <label htmlFor="recipient-facts" className="text-sm font-medium text-foreground">
            Feiten die je wil meegeven over de ontvanger
          </label>
          <textarea
            id="recipient-facts"
            value={recipientFacts}
            onChange={(e) => onRecipientFactsChange(e.target.value)}
            placeholder="Bijv. Houdt van koffie, speelt gitaar, werkt als leraar..."
            rows={4}
            className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none"
          />
        </div>

        {/* Number of Lines */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label htmlFor="lines" className="text-sm font-medium text-foreground">
              Aantal Regels
            </label>
            <span className="inline-flex items-center justify-center min-w-[3rem] h-8 px-3 rounded-md bg-primary/10 text-primary font-semibold text-sm">
              {numLines}
            </span>
          </div>
          <input
            id="lines"
            type="range"
            min="4"
            max="20"
            value={numLines}
            onChange={(e) => onNumLinesChange(Number.parseInt(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>4</span>
            <span>20</span>
          </div>
        </div>

        {/* Style Toggle */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground block">Gedicht Stijl</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onStyleToggle(true)}
              className={`p-3 rounded-lg border-2 font-medium text-sm transition-all ${
                isClassic
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-accent/50'
              }`}
            >
              Klassiek
            </button>
            <button
              onClick={() => onStyleToggle(false)}
              className={`p-3 rounded-lg border-2 font-medium text-sm transition-all ${
                !isClassic
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-accent/50'
              }`}
            >
              Vrij Stromend
            </button>
          </div>
        </div>

        {/* Friendliness Scale */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label htmlFor="friendliness" className="text-sm font-medium text-foreground">
              Vriendelijkheid
            </label>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              {getFriendlinessLabel()}
            </span>
          </div>
          <Slider
            id="friendliness"
            min={0}
            max={100}
            step={5}
            value={[friendliness]}
            onValueChange={(value) => onFriendlinessChange(value[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>Spicy</span>
            <span>Vriendelijk</span>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={onGeneratePoem}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 sm:py-4 text-base rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          aria-disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              <span>Aan het genereren...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>✨</span>
              <span>Genereer Gedicht</span>
            </span>
          )}
        </Button>

        {/* Info Box */}
        <div className="bg-muted/50 border border-border rounded-lg p-3.5 space-y-1.5">
          <p className="text-xs font-semibold text-foreground/80 flex items-center gap-1.5">
            <span>💡</span>
            <span>Tip</span>
          </p>
          <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed">
            Lagere vriendelijkheid geeft scherpere grappen, hogere geeft meer aardige complimenten.
          </p>
        </div>
      </div>
    </Card>
  );
}
