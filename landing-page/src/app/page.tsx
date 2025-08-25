'use client';

import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Stats from '../components/Stats';
import Testimonials from '../components/Testimonials';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';
import Particles from '../components/Particles';

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-dark-bg overflow-hidden">
      <Particles />
      
      <Hero />
      <Features />
      <Stats />
      <Testimonials />
      <Pricing />
      <Footer />
    </main>
  );
}