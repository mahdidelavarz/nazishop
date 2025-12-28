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
    <div className="bg-gradient-to-r from-primary-300 via-primary-500 to-primary-200 text-white py-2 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 text-xs font-medium">
          <Icon icon={promos[currentPromo].icon} width={16} />
          <span className="animate-fade-in">{promos[currentPromo].text}</span>
        </div>
      </div>
    </div>
  );
}

