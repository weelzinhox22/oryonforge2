'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Standard window scroll
    window.scrollTo(0, 0);
    
    // Also try to scroll any main content containers if they handle their own scroll
    const main = document.querySelector('main');
    if (main) {
      main.scrollTo(0, 0);
    }
    
    // For specific dashboard containers that might have overflow-y-auto
    const scrollContainers = document.querySelectorAll('.overflow-y-auto');
    scrollContainers.forEach(container => {
      container.scrollTo(0, 0);
    });
  }, [pathname]);

  return null;
}
