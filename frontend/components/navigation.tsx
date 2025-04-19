'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { BookOpen, Brain, Home, Settings, User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';

export function Navigation() {
  const pathname = usePathname();

  const routes = [
    {
      name: 'Home',
      path: '/',
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: 'Flashcards',
      path: '/flashcards',
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      name: 'Teach Back',
      path: '/teach',
      icon: <Brain className="h-5 w-5" />,
    },
  ];

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-2">
          <BookOpen className="text-primary h-6 w-6" />
          <span className="text-xl font-bold">CogniFlow</span>
        </div>
        <nav className="ml-auto flex items-center gap-4 md:gap-6">
          <div className="hidden items-center gap-6 md:flex">
            {routes.map(route => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  'hover:text-primary flex items-center gap-2 text-sm font-medium transition-colors',
                  pathname === route.path ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {route.icon}
                {route.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
