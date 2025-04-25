import React from 'react';

export function SiteFooter() {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} WellSync AI. All rights reserved.
        </p>
        <nav className="flex gap-4 sm:gap-6">
          {/* Add footer links here if needed */}
        </nav>
      </div>
    </footer>
  );
} 