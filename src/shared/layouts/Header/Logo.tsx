"use client";

import { Icon } from '@iconify/react';
import Link from 'next/link';

interface LogoProps {
  mobile?: boolean;
}

export function Logo({ mobile = false }: LogoProps) {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div className="relative">
        <div
          className={`${
            mobile ? 'w-9 h-9' : 'w-10 h-10'
          } bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-primary-300 transition-all group-hover:scale-105`}
        >
          <Icon icon="mdi:lipstick" className="text-white" width={mobile ? 20 : 22} />
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-400 rounded-full blur-sm"></div>
      </div>
      <div>
        <h1
          className={`${
            mobile ? 'text-base' : 'text-lg'
          } font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent`}
        >
          گلامور شاپ
        </h1>
        {!mobile && (
          <p className="text-[9px] text-neutral-500">زیبایی در هر لحظه</p>
        )}
      </div>
    </Link>
  );
}

