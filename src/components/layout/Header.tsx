import { CarFront } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <CarFront className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl sm:inline-block">
            RapidRyde
          </span>
        </Link>
        {/* Placeholder for future navigation items or user profile */}
        {/* <nav className="flex flex-1 items-center justify-end space-x-4">
          <Button variant="ghost" size="sm">Login</Button>
        </nav> */}
      </div>
    </header>
  );
}
