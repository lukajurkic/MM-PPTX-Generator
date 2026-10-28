/**
 * Supported slide aspect ratios for PowerPoint export
 */
export type AspectRatio = '16x9' | '4x3';

/**
 * Standard, safe cross-platform fonts available in PowerPoint
 */
export const SUPPORTED_FONTS = [
  'Verdana',
  'Arial',
  'Calibri',
  'Trebuchet MS',
  'Tahoma',
  'Georgia',
  'Times New Roman'
] as const;

export type SupportedFont = typeof SUPPORTED_FONTS[number];

/**
 * Quick color preset swatches for background and typography
 */
export const COLOR_PRESETS = {
  background: [
    { label: 'Crna (Zadano)', hex: '#000000' },
    { label: 'SKAC Plava', hex: '#074d97' },
    { label: 'Tamnoplava / Slate', hex: '#111827' },
    { label: 'Tamnosiva', hex: '#1e293b' },
    { label: 'Duboka ljubičasta', hex: '#2e1065' }
  ],
  text: [
    { label: 'Bijela (Zadano)', hex: '#ffffff' },
    { label: 'Topla žuta', hex: '#fcd34d' },
    { label: 'Svijetloplava', hex: '#93c5fd' },
    { label: 'Meka srebrna', hex: '#e2e8f0' },
    { label: 'Svijetlozelena', hex: '#86efac' }
  ]
};

/**
 * Complete presentation customization settings interface
 */
export interface PresentationSettings {
  /** Slide aspect ratio: '16x9' widescreen (10" x 5.625") or '4x3' standard (10" x 7.5") */
  aspectRatio: AspectRatio;

  /** Insert a blank transition slide between distinct songs */
  blankSlideBetweenSongs: boolean;

  /** Insert an intro blank slide before the first song and an outro blank slide after the last song */
  blankSlideStartEnd: boolean;

  /** Main lyrics font family */
  fontFamily: SupportedFont | string;

  /** Fixed lyrics font size in points (32pt to 48pt) when autoFontSize is false */
  fontSizeOverride: number;

  /** When true, automatically adjusts font size (32-44pt) based on stanza line count and line lengths */
  autoFontSize: boolean;

  /** Main lyrics text color in hex format (e.g. '#ffffff') */
  textColor: string;

  /** Slide solid background color in hex format (e.g. '#000000') */
  backgroundColor: string;

  /** Whether to render the vertical song title along the right edge */
  showSideTitle: boolean;

  /** Side song title font family */
  sideTitleFontFamily: SupportedFont | string;

  /** Side song title font size in points (8pt to 18pt) */
  sideTitleFontSize: number;

  /** Horizontal offset for side title in centimeters (0.0 cm to 3.0 cm from right edge) */
  sideTitleHorizontalOffsetCm: number;

  /** Whether to render the SKAC logo in the bottom-right corner */
  showLogo: boolean;

  /** Logo size scaling percentage (50% to 180%) */
  logoScalePercent: number;

  /** Logo transparency percentage (0% = completely opaque, 100% = invisible) */
  logoTransparency: number;
}

/**
 * Repository default presentation preferences
 */
export const DEFAULT_PRESENTATION_SETTINGS: Readonly<PresentationSettings> = {
  aspectRatio: '16x9',
  blankSlideBetweenSongs: true,
  blankSlideStartEnd: true,
  fontFamily: 'Verdana',
  fontSizeOverride: 40,
  autoFontSize: true,
  textColor: '#ffffff',
  backgroundColor: '#000000',
  showSideTitle: true,
  sideTitleFontFamily: 'Verdana',
  sideTitleFontSize: 11,
  sideTitleHorizontalOffsetCm: 0.0,
  showLogo: true,
  logoScalePercent: 100,
  logoTransparency: 35
};
