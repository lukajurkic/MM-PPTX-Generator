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

  /** Whether lyrics text is bold */
  bold: boolean;

  /** Whether lyrics text is italic */
  italic: boolean;

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
  bold: true,
  italic: false,
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

/**
 * Checks whether current presentation settings match repository defaults
 */
export function arePresentationSettingsDefault(settings: PresentationSettings): boolean {
  if (settings.aspectRatio !== DEFAULT_PRESENTATION_SETTINGS.aspectRatio) {
    return false;
  }
  if (settings.blankSlideBetweenSongs !== DEFAULT_PRESENTATION_SETTINGS.blankSlideBetweenSongs) {
    return false;
  }
  if (settings.blankSlideStartEnd !== DEFAULT_PRESENTATION_SETTINGS.blankSlideStartEnd) {
    return false;
  }
  if (settings.fontFamily !== DEFAULT_PRESENTATION_SETTINGS.fontFamily) {
    return false;
  }
  if (settings.bold !== DEFAULT_PRESENTATION_SETTINGS.bold) {
    return false;
  }
  if (settings.italic !== DEFAULT_PRESENTATION_SETTINGS.italic) {
    return false;
  }
  if (settings.autoFontSize !== DEFAULT_PRESENTATION_SETTINGS.autoFontSize) {
    return false;
  }
  if (!settings.autoFontSize && settings.fontSizeOverride !== DEFAULT_PRESENTATION_SETTINGS.fontSizeOverride) {
    return false;
  }
  if (settings.textColor.trim().toLowerCase() !== DEFAULT_PRESENTATION_SETTINGS.textColor.toLowerCase()) {
    return false;
  }
  if (settings.backgroundColor.trim().toLowerCase() !== DEFAULT_PRESENTATION_SETTINGS.backgroundColor.toLowerCase()) {
    return false;
  }
  if (settings.showSideTitle !== DEFAULT_PRESENTATION_SETTINGS.showSideTitle) {
    return false;
  }
  if (settings.showSideTitle) {
    if (settings.sideTitleFontFamily !== DEFAULT_PRESENTATION_SETTINGS.sideTitleFontFamily) {
      return false;
    }
    if (settings.sideTitleFontSize !== DEFAULT_PRESENTATION_SETTINGS.sideTitleFontSize) {
      return false;
    }
    if (settings.sideTitleHorizontalOffsetCm !== DEFAULT_PRESENTATION_SETTINGS.sideTitleHorizontalOffsetCm) {
      return false;
    }
  }
  if (settings.showLogo !== DEFAULT_PRESENTATION_SETTINGS.showLogo) {
    return false;
  }
  if (settings.showLogo) {
    if (settings.logoScalePercent !== DEFAULT_PRESENTATION_SETTINGS.logoScalePercent) {
      return false;
    }
    if (settings.logoTransparency !== DEFAULT_PRESENTATION_SETTINGS.logoTransparency) {
      return false;
    }
  }
  return true;
}

