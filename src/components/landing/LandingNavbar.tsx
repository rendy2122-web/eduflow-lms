'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { School } from 'lucide-react';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#fitur', label: 'Fitur' },
    { href: '#solusi', label: 'Solusi Peran' },
    { href: '#pricing', label: 'Harga' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <header className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="navbar-inner">
          <Link href="/" className="brand" aria-label="EduFlow Home">
            <div className="brand-icon">
              <School className="w-5 h-5 text-white" />
            </div>
            <span className="brand-text">EduFlow</span>
          </Link>

          <nav className={`nav-links ${mobileOpen ? 'open' : ''}`}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link" onClick={() => setMobileOpen(false)}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="navbar-actions">
            <Link href="/login" className="btn-login">
              Portal Login
            </Link>
            <button
              className="mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span className={`hamburger ${mobileOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
