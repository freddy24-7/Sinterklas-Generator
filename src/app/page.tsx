'use client';
import SinterklaasHero from '@/components/sinterklaas-hero';
import PoemGenerator from '@/components/poem-generator';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-full">
        <article itemScope itemType="https://schema.org/Article">
          <SinterklaasHero />
          <PoemGenerator />
        </article>
      </div>
    </main>
  );
}
