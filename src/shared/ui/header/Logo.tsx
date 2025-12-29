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
            mobile ? 'w-9 h-9' : 'w-12 h-12'
          } relative rounded-xl flex items-center justify-center overflow-hidden shadow-[0_2px_12px_rgba(168,85,247,0.25)] group-hover:shadow-[0_3px_16px_rgba(168,85,247,0.35)] transition-all duration-500 group-hover:scale-105`}
        >
          {/* Base gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-accent-200 to-primary-400" />
          
          {/* Depth layers */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/20" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
          
          <Icon icon="mdi:lipstick" className="relative z-10 text-white" width={mobile ? 20 : 22} />
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-400 rounded-full blur-sm"></div>
      </div>
      <div>
        <h1
          className={`${
            mobile ? 'text-base' : 'text-2xl'
          } font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent`}
        >
          گلامور شاپ
        </h1>
        {!mobile && (
          <p className="text-[12px] text-neutral-500">زیبایی در هر لحظه</p>
        )}
      </div>
    </Link>
  );
}

