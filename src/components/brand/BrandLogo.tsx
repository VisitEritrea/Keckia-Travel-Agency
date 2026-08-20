import React from 'react';
import { BRAND } from '../../../shared/brand';

/**
 * The EritreaVisit identity, in the two forms the suite needs.
 *
 * `BrandMark` is a vector redraw of the logo symbol — the Red Sea cyan ring
 * around the orange Asmara monument — so it stays crisp at 20px in the
 * sidebar and at 200px on a printed letterhead. `BrandLockup` pairs it with
 * the wordmark for headers, and `BrandLogoImage` places the supplied logo
 * artwork itself where the full original is wanted (sign-in, documents).
 */

export const BRAND_ORANGE = '#EF5423';
export const BRAND_CYAN = '#12AEEB';

interface MarkProps {
  className?: string;
  /** Renders the ring and monument in white for dark backgrounds. */
  mono?: boolean;
  title?: string;
}

export const BrandMark: React.FC<MarkProps> = ({ className = 'h-8 w-8', mono = false, title }) => {
  const ring = mono ? 'currentColor' : BRAND_CYAN;
  const fill = mono ? 'currentColor' : BRAND_ORANGE;
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={title ?? BRAND.name}>
      {title ? <title>{title}</title> : null}
      <circle cx="32" cy="32" r="23" fill="none" stroke={ring} strokeWidth="4.5" />
      <g fill={fill}>
        <path d="M10 37.4c7.4-2.1 14.8-3.1 22-3.1s14.6 1 22 3.1v2.2c-7.4-1.5-14.8-2.3-22-2.3s-14.6.8-22 2.3z" />
        <rect x="27.4" y="31.2" width="9.2" height="3.4" />
        <rect x="28.8" y="18.6" width="6.4" height="12.6" />
        <rect x="29.6" y="9.4" width="1.5" height="9.6" />
        <rect x="32.9" y="9.4" width="1.5" height="9.6" />
        <path d="M31.2 21.6h1.6v5.6l1.5-.6-2.3 3.4-2.3-3.4 1.5.6z" />
      </g>
    </svg>
  );
};

/** The supplied logo artwork. Use on white surfaces and printed documents. */
export const BrandLogoImage: React.FC<{ className?: string }> = ({ className = 'h-12' }) => (
  <img
    src="/brand/eritreavisit-logo.jpg"
    alt={`${BRAND.name} logo`}
    className={`${className} w-auto object-contain`}
    loading="eager"
  />
);

interface LockupProps {
  className?: string;
  /** Sizes the mark and the wordmark together. */
  size?: 'sm' | 'md' | 'lg';
  /** Light text for dark panels. */
  inverted?: boolean;
  subtitle?: string;
}

const SIZES = {
  sm: { mark: 'h-8 w-8', name: 'text-base', sub: 'text-[9px]' },
  md: { mark: 'h-11 w-11', name: 'text-lg', sub: 'text-[10px]' },
  lg: { mark: 'h-14 w-14', name: 'text-2xl', sub: 'text-[11px]' },
} as const;

export const BrandLockup: React.FC<LockupProps> = ({
  className = '',
  size = 'md',
  inverted = false,
  subtitle,
}) => {
  const s = SIZES[size];
  return (
    <div className={`flex items-center gap-3 min-w-0 ${className}`}>
      <div
        className={`shrink-0 rounded-2xl p-1.5 ${
          inverted ? 'bg-white/10 ring-1 ring-white/15' : 'bg-white ring-1 ring-slate-200 shadow-xs'
        }`}
      >
        <BrandMark className={s.mark} />
      </div>
      <div className="min-w-0">
        <div
          className={`font-display font-extrabold tracking-tight leading-tight truncate ${s.name} ${
            inverted ? 'text-white' : 'text-slate-900'
          }`}
        >
          <span className={inverted ? 'text-brand-400' : 'text-brand-600'}>ERITREA</span>
          <span className={inverted ? 'text-lagoon-300' : 'text-lagoon-500'}>VISIT</span>
        </div>
        <div
          className={`uppercase tracking-[0.2em] font-semibold truncate ${s.sub} ${
            inverted ? 'text-lagoon-200/80' : 'text-slate-500'
          }`}
        >
          {subtitle ?? BRAND.tagline}
        </div>
      </div>
    </div>
  );
};
