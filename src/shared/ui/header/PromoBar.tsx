"use client";

import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';

export function PromoBar() {
  const promos = [
    { icon: 'ph:gift-duotone', text: 'ارسال رایگان برای خرید بالای 500 هزار تومان' },
    { icon: 'ph:percent-duotone', text: 'تخفیف ویژه محصولات آرایشی تا 40%' },
    { icon: 'ph:headset-duotone', text: 'پشتیبانی 24 ساعته' },
  ];

  const [currentPromo, setCurrentPromo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [promos.length]);

  return (
    <div className="relative overflow-hidden">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-400 via-accent-200 to-primary-400" />
      
      {/* Depth layers */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/20" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-white">
          <Icon icon={promos[currentPromo].icon} width={16} className="relative z-10" />
          <span className="animate-fade-in relative z-10">{promos[currentPromo].text}</span>
        </div>
      </div>
    </div>
  );
}

