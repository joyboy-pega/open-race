'use client';

import React from 'react';

export interface PixelIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const baseStyle = (size: number, style?: React.CSSProperties): React.CSSProperties => ({
  display: 'inline-block',
  verticalAlign: '-0.15em',
  width: size,
  height: size,
  flexShrink: 0,
  shapeRendering: 'crispEdges',
  ...style,
});

/** Pixel Coin (Arcade Token) */
export function PixelCoin({ size = 14, style, className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" style={baseStyle(size, style)} className={className} fill="currentColor" {...props}>
      {/* Outer border */}
      <path d="M5 2h6v1h2v2h1v6h-1v2h-2v1H5v-1H3v-2H2V5h1V3h2V2z" fill="currentColor" />
      {/* Inner highlight & center groove */}
      <path d="M5 4h6v1h1v6h-1v1H5v-1H4V5h1V4z" fill="none" />
      <path d="M7 5h2v6H7V5z" fill="var(--ink, #08090d)" />
    </svg>
  );
}

/** Pixel Lightning Bolt (ERS / Energy / Level) */
export function PixelBolt({ size = 14, style, className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" style={baseStyle(size, style)} className={className} fill="currentColor" {...props}>
      <path d="M9 1h4v3h-2v2h-2v2h4v2h-2v2h-2v2H7v-3h2v-2h2v-2H7V5h2V3h2V1H9z" />
    </svg>
  );
}

/** Pixel Map (Circuit Directory) */
export function PixelMap({ size = 14, style, className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" style={baseStyle(size, style)} className={className} fill="currentColor" {...props}>
      <path d="M2 3h4v1H5v8h1v1H2V3zm5 1h2v1H8v8h1v1H7V4zm4 0h3v9h-3V4zm-1 0h1v8h-1V4z" />
    </svg>
  );
}

/** Pixel Sun (Clear / Day) */
export function PixelSun({ size = 14, style, className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" style={baseStyle(size, style)} className={className} fill="currentColor" {...props}>
      {/* Rays */}
      <path d="M7 1h2v2H7V1zm0 12h2v2H7v-2zM1 7h2v2H1V7zm12 0h2v2h-2V7zM3 3h2v2H3V3zm8 8h2v2h-2v-2zm0-8h2v2h-2V3zm-8 8h2v2H3v-2z" />
      {/* Core */}
      <path d="M6 5h4v1h1v4h-1v1H6v-1H5V6h1V5z" />
    </svg>
  );
}

/** Pixel Rain (Wet Track) */
export function PixelRain({ size = 14, style, className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" style={baseStyle(size, style)} className={className} fill="currentColor" {...props}>
      {/* Cloud */}
      <path d="M5 3h5v1h2v2h1v3h-1v1H3V9H2V6h1V4h2V3z" />
      {/* Drops */}
      <path d="M4 11h1v2H4v-2zm4 1h1v2H8v-2zm4-1h1v2h-1v-2zm-6 3h1v2H6v-2zm4 0h1v2h-1v-2z" />
    </svg>
  );
}

/** Pixel Snow (Winter Track) */
export function PixelSnow({ size = 14, style, className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" style={baseStyle(size, style)} className={className} fill="currentColor" {...props}>
      {/* Six-ray pixel snowflake */}
      <path d="M7 1h2v4H7V1zm0 10h2v4H7v-4zm-6-4h4v2H1V7zm10 0h4v2h-4V7zm-8-4h2v2H3V3zm8 8h2v2h-2v-2zm0-8h2v2h-2V3zm-8 8h2v2H3v-2zM6 6h4v4H6V6z" />
    </svg>
  );
}

/** Pixel Sunset (Golden Hour) */
export function PixelSunset({ size = 14, style, className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" style={baseStyle(size, style)} className={className} fill="currentColor" {...props}>
      {/* Sun top half */}
      <path d="M6 3h4v1h2v3H4V4h2V3z" />
      {/* Horizon rays */}
      <path d="M1 9h14v1H1V9zm2 2h10v1H3v-1zm3 2h4v1H6v-1z" />
    </svg>
  );
}

/** Pixel Moon (Night Track) */
export function PixelMoon({ size = 14, style, className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" style={baseStyle(size, style)} className={className} fill="currentColor" {...props}>
      <path d="M7 2h4v1h2v2h1v4h-1v2h-2v1h-2v1H5v-1H4v-1h2V9h1V8h1V7h1V5H8V4H7V2z" />
    </svg>
  );
}

/** Pixel Camera (POV / View Angle) */
export function PixelCamera({ size = 14, style, className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" style={baseStyle(size, style)} className={className} fill="currentColor" {...props}>
      {/* Shutter button & top */}
      <path d="M3 3h3v1h4V3h2v1h1v1h1v8h-1v1H2v-1H1V5h1V4h1V3z" />
      {/* Lens aperture cutout */}
      <path d="M6 6h4v4H6V6z" fill="var(--ink, #08090d)" />
    </svg>
  );
}

/** Pixel Gamepad (Free Camera / Manual Mode) */
export function PixelGamepad({ size = 14, style, className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" style={baseStyle(size, style)} className={className} fill="currentColor" {...props}>
      {/* Controller body */}
      <path d="M3 4h10v1h1v6h-1v2h-2v-1h-1V9H6v3H5v1H3v-2H2V5h1V4z" />
      {/* D-Pad & Button cutouts */}
      <path d="M4 6h1v2H4V6zm1 1h1v1H5V7zm5-1h1v1h-1V6zm1 2h1v1h-1V8z" fill="var(--ink, #08090d)" />
    </svg>
  );
}

/** Pixel Rotate / Spin (Showroom Turntable) */
export function PixelRotate({ size = 14, style, className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" style={baseStyle(size, style)} className={className} fill="currentColor" {...props}>
      {/* Circular arrow */}
      <path d="M7 2h5v1h2v4h-2V4h-1V3H7V2zM2 9h2v3h1v1h5v1H5v-1H3v-4zm9-4h3v3h-1V6h-2V5zM2 8h3v1H3v2H2V8z" />
    </svg>
  );
}

/** Pixel Mouse (Orbit Drag / Zoom) */
export function PixelMouse({ size = 14, style, className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" style={baseStyle(size, style)} className={className} fill="currentColor" {...props}>
      {/* Mouse body */}
      <path d="M5 2h6v1h2v9h-1v2h-1v1H5v-1H4v-2H3V3h2V2z" />
      {/* Scroll wheel line */}
      <path d="M7 4h2v3H7V4z" fill="var(--ink, #08090d)" />
    </svg>
  );
}

/** Pixel Flag (Checkered Race Finish) */
export function PixelFlag({ size = 14, style, className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" style={baseStyle(size, style)} className={className} fill="currentColor" {...props}>
      {/* Pole */}
      <path d="M2 2h2v13H2V2z" />
      {/* Checkered pattern */}
      <path d="M4 3h2v2H4V3zm2 0h2v2H6V3zm2 0h2v2H8V3zm2 0h2v2h-2V3zM4 5h2v2H4V5zm2 0h2v2H6V5zm2 0h2v2H8V5zm2 0h2v2h-2V5zM4 7h2v2H4V7zm2 0h2v2H6V7zm2 0h2v2H8V7zm2 0h2v2h-2V7z" />
    </svg>
  );
}

/** Pixel Clipboard (Copy Room Link) */
export function PixelClipboard({ size = 14, style, className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" style={baseStyle(size, style)} className={className} fill="currentColor" {...props}>
      {/* Top Clip */}
      <path d="M6 1h4v2H6V1z" />
      {/* Board */}
      <path d="M3 3h2v1h6V3h2v11H3V3zm2 3h6v1H5V6zm0 3h6v1H5V9zm0 3h4v1H5v-1z" />
    </svg>
  );
}

/** Pixel Warning (Alert / Caution) */
export function PixelWarning({ size = 14, style, className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" style={baseStyle(size, style)} className={className} fill="currentColor" {...props}>
      {/* Triangle */}
      <path d="M7 2h2v2h1v2h1v2h1v2h1v2h1v1H1v-1h1v-2h1v-2h1v-2h1v-2h1V2z" />
      {/* Center exclamation */}
      <path d="M7 6h2v3H7V6zm0 4h2v2H7v-2z" fill="var(--ink, #08090d)" />
    </svg>
  );
}

/** Pixel Hourglass (Waiting for Players) */
export function PixelHourglass({ size = 14, style, className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" style={baseStyle(size, style)} className={className} fill="currentColor" {...props}>
      <path d="M3 2h10v2h-1v1h-1v1h-1v1H8v2h1v1h1v1h1v1h1v2H3v-2h1v-1h1v-1h1v-1h1V7H6V6H5V5H4V4H3V2z" />
    </svg>
  );
}

/** Pixel Checkmark */
export function PixelCheck({ size = 14, style, className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" style={baseStyle(size, style)} className={className} fill="currentColor" {...props}>
      <path d="M12 4h2v2h-2V4zm-2 2h2v2h-2V6zm-2 2h2v2H8V8zm-2 2h2v2H6v-2zM4 8h2v2H4V8zm-2 0h2v2H2V8z" />
    </svg>
  );
}

/** Pixel Cross / Close (X) */
export function PixelCross({ size = 14, style, className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" style={baseStyle(size, style)} className={className} fill="currentColor" {...props}>
      <path d="M3 3h2v2H3V3zm8 0h2v2h-2V3zm-2 2h2v2H9V5zm-2 2h2v2H7V7zm-2-2h2v2H5V5zm0 4h2v2H5V9zm4 0h2v2H9V9zm2 2h2v2h-2v-2zm-8 0h2v2H3v-2z" />
    </svg>
  );
}

/** Pixel Compass (Telemetry Guide) */
export function PixelCompass({ size = 14, style, className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 16 16" style={baseStyle(size, style)} className={className} fill="currentColor" {...props}>
      {/* Outer ring */}
      <path d="M5 2h6v1h2v2h1v6h-1v2h-2v1H5v-1H3v-2H2V5h1V3h2V2z" />
      {/* Diamond needle */}
      <path d="M8 4h1v3h1v1H8V4zm0 8h-1V9H6V8h2v4z" fill="var(--ink, #08090d)" />
    </svg>
  );
}

/** Pixel Dot (DRS Active indicator) */
export function PixelDot({ size = 8, style, className, ...props }: PixelIconProps) {
  return (
    <svg viewBox="0 0 8 8" style={baseStyle(size, style)} className={className} fill="currentColor" {...props}>
      <path d="M2 0h4v1h1v1h1v4H7v1H6v1H2V7H1V6H0V2h1V1h1V0z" />
    </svg>
  );
}
