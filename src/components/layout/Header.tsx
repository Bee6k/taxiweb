"use client";
import { CarFront } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRole } from '@/contexts/RoleContext';

export function Header() {
  const { role, setRole } = useRole();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <CarFront className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl sm:inline-block">
            RapidRyde
          </span>
        </Link>
        <nav className="flex flex-1 items-center justify-start space-x-2 sm:space-x-4">
          <Button 
            variant={role === 'user' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setRole('user')}
            className={role === 'user' ? 'bg-primary text-primary-foreground' : ''}
          >
            User
          </Button>
          <Button 
            variant={role === 'driver' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setRole('driver')}
            className={role === 'driver' ? 'bg-primary text-primary-foreground' : ''}
          >
            Driver
          </Button>
          <Button 
            variant={role === 'admin' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setRole('admin')}
            className={role === 'admin' ? 'bg-primary text-primary-foreground' : ''}
          >
            Admin
          </Button>
        </nav>
      </div>
    </header>
  );
}
