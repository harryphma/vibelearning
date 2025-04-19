'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="relative h-10 w-10 mr-2">
                <Image
                  src="/logo.png"
                  alt="CogniFlow Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <span className="text-xl font-bold text-gray-900">CogniFlow</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
              Home
            </Link>
            <Link href="#features" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
              Features
            </Link>
            <Link href="#about" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
              About
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex">
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
              asChild
            >
              <Link href="/auth/login">Log In</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            <Link
              href="/"
              className="block py-2 text-gray-600 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="#features"
              className="block py-2 text-gray-600 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#about"
              className="block py-2 text-gray-600 hover:text-blue-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="mt-4 py-2">
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                asChild
              >
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  Log In
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 