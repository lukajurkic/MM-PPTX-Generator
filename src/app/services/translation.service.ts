import { Injectable, computed, signal } from '@angular/core';

export type Language = 'hr' | 'en';

export interface Translations {
  // Header
  appTitle: string;
  appSubtitle: string;
  songsAvailable: (count: number) => string;
  requestNewSongBtn: string;

  // Language switcher
  langToggleTitle: string;

  // Song Catalog (Left Panel)
  catalogTitle: string;
  searchPlaceholder: string;
  clearSearch: string;
  showingSongsCounter: (shown: number, total: number) => string;
  loadingCatalog: string;
  noSongsFoundTitle: string;
  noSongsFoundDesc: (query: string) => string;
  catalogEmptyDesc: string;
  clearSearchBtn: string;
  slidesCount: (count: number) => string;
  addBtn: string;
  addedBtn: (count: number) => string;
  lyricPreviewHint: string;
  categoriesLabel: string;
  massSectionsLabel: string;
  filterByCategory: string;
  filterByMassSection: string;
  filterAllCategories: string;
  filterAllMassSections: string;
  clearFiltersBtn: string;
  activeFiltersLabel: (count: number) => string;

  // Playlist Queue (Right Panel)
  queueTitle: string;
  clearAllBtn: string;
  selectedSongsMetric: string;
  lyricSlidesMetric: string;
  estTotalSlidesMetric: string;
  emptyQueueTitle: string;
  emptyQueueDesc: string;
  moveUpTooltip: string;
  moveDownTooltip: string;
  removeTooltip: string;
  blankTransitionTag: string;
  exportPresentationBtn: string;
  generatingPresentationBtn: string;
  presentationSettingsHint: string;
  exportSuccessMsg: (filename: string) => string;
  exportErrorEmpty: string;
  exportErrorGeneric: string;

  // Request Song Modal
  modalTitle: string;
  modalSubtitle: (email: string) => string;
  modalCloseTooltip: string;
  fieldSongTitle: string;
  fieldSongTitlePlaceholder: string;
  fieldLyrics: string;
  fieldLyricsHint: string;
  fieldLyricsPlaceholder: string;
  fieldCategory: string;
  fieldCategoryPlaceholder: string;
  fieldCategoryHint: string;
  fieldMassSection: string;
  fieldMassSectionPlaceholder: string;
  fieldMassSectionHint: string;
  fieldSubmitterName: string;
  fieldSubmitterNamePlaceholder: string;
  fieldSubmitterEmail: string;
  fieldSubmitterEmailPlaceholder: string;
  fieldNotes: string;
  fieldNotesPlaceholder: string;
  requiredMark: string;
  optionalMark: string;
  cancelBtn: string;
  sendRequestBtn: string;
  sendingRequestBtn: string;
  requestSentAlertTitle: string;
  requestFailedAlertTitle: string;
  requestTitleRequiredError: string;
  requestLyricsRequiredError: string;

  // Song Lyrics Modal
  lyricsModalTitle: string;
  stanzaLabel: (index: number) => string;
  copyLyricsBtn: string;
  lyricsCopiedNotice: string;
  closeBtn: string;
  clickToViewLyricsHint: string;
  addToPlaylistBtn: string;
  addedToPlaylistBtn: (count: number) => string;

  // Settings Drawer (Task 10)
  settingsBtn: string;
  settingsTitle: string;
  settingsSubtitle: string;
  aspectRatioSection: string;
  aspectRatio169Label: string;
  aspectRatio43Label: string;
  blankSlidesSection: string;
  blankSlideBetweenSongsLabel: string;
  blankSlideStartEndLabel: string;
  typographySection: string;
  fontFamilyLabel: string;
  fontSizeLabel: string;
  autoFontSizeLabel: string;
  customFontSizeLabel: string;
  textColorLabel: string;
  backgroundColorLabel: string;
  sideTitleSection: string;
  showSideTitleLabel: string;
  sideTitleFontLabel: string;
  sideTitleSizeLabel: string;
  sideTitleOffsetLabel: string;
  logoSection: string;
  showLogoLabel: string;
  logoSizeLabel: string;
  logoTransparencyLabel: string;
  resetSettingsBtn: string;
  closeSettingsBtn: string;
  previewSection: string;
}

const TRANSLATIONS_HR: Translations = {
  // Header
  appTitle: 'PPTX Izrađivač Pjesama',
  appSubtitle: 'Generator prezentacija širokog formata',
  songsAvailable: (count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) {
      return `${count} Pjesma dostupna`;
    } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
      return `${count} Pjesme dostupne`;
    }
    return `${count} Pjesama dostupno`;
  },
  requestNewSongBtn: 'Zatraži novu pjesmu',
  langToggleTitle: 'Promijeni jezik (Hrvatski / Engleski)',

  // Catalog
  catalogTitle: 'Katalog pjesama',
  searchPlaceholder: 'Pretraži po naslovu ili stihovima...',
  clearSearch: 'Očisti unos pretrage',
  showingSongsCounter: (shown: number, total: number) => `${shown} od ${total}`,
  loadingCatalog: 'Učitavanje pjesama...',
  noSongsFoundTitle: 'Nema pronađenih pjesama',
  noSongsFoundDesc: (query: string) => `Nema rezultata za "${query}"`,
  catalogEmptyDesc: 'Repozitorij pjesama je trenutno prazan.',
  clearSearchBtn: 'Očisti pretragu',
  slidesCount: (count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) return `${count} Slajd`;
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return `${count} Slajda`;
    return `${count} Slajdova`;
  },
  addBtn: 'Dodaj',
  addedBtn: (count: number) => `Dodano (${count})`,
  lyricPreviewHint: 'Pregled stihova',
  categoriesLabel: 'Kategorije',
  massSectionsLabel: 'Dijelovi mise',
  filterByCategory: 'Filtriraj po kategoriji',
  filterByMassSection: 'Filtriraj po dijelu mise',
  filterAllCategories: 'Sve kategorije',
  filterAllMassSections: 'Svi dijelovi mise',
  clearFiltersBtn: 'Poništi filtere',
  activeFiltersLabel: (count: number) => `${count} aktivnih filtera`,

  // Playlist Queue
  queueTitle: 'Lista za prezentaciju',
  clearAllBtn: 'Očisti sve',
  selectedSongsMetric: 'Odabrano pjesama',
  lyricSlidesMetric: 'Slajdovi stihova',
  estTotalSlidesMetric: 'Ukupno slajdova',
  emptyQueueTitle: 'Lista za prezentaciju je prazna',
  emptyQueueDesc: 'Odaberite pjesme iz kataloga s lijeve strane klikom na "+ Dodaj" kako biste sastavili prezentaciju.',
  moveUpTooltip: 'Pomakni prema gore',
  moveDownTooltip: 'Pomakni prema dolje',
  removeTooltip: 'Ukloni s liste',
  blankTransitionTag: '+ 1 Prazan prijelaz',
  exportPresentationBtn: 'Generiraj i preuzmi prezentaciju (.pptx)',
  generatingPresentationBtn: 'Generiranje prezentacije u tijeku...',
  presentationSettingsHint: '16:9 Široki zaslon • Crna pozadina • Bijeli podebljani Verdana font',
  exportSuccessMsg: (filename: string) => `Prezentacija "${filename}" uspješno preuzeta!`,
  exportErrorEmpty: 'Lista je prazna. Odaberite barem jednu pjesmu.',
  exportErrorGeneric: 'Neuspjelo generiranje PowerPoint prezentacije.',

  // Request Modal
  modalTitle: 'Zatraži novu pjesmu',
  modalSubtitle: (email: string) => `Pošaljite podatke o pjesmi kako bi zahtjev stigao na`,
  modalCloseTooltip: 'Zatvori (ESC)',
  fieldSongTitle: 'Naslov pjesme',
  fieldSongTitlePlaceholder: 'npr., Divan si, Milost, Blagoslovljen budi',
  fieldLyrics: 'Stihovi',
  fieldLyricsHint: 'Odvojite strofe praznim retkom za podjelu na slajdove',
  fieldLyricsPlaceholder: 'Unesite ili zalijepite stihove ovdje...\n\nSvaku strofu i refren odvojite jednim praznim redom za izradu zasebnih slajdova.',
  fieldCategory: 'Kategorija',
  fieldCategoryPlaceholder: 'Odaberite ili upišite kategoriju (npr. Slavljenje, Zahvala...)',
  fieldCategoryHint: 'Odaberite s popisa ili upišite vlastitu kategoriju',
  fieldMassSection: 'Dio mise',
  fieldMassSectionPlaceholder: 'Odaberite ili upišite dio mise (npr. Ulazna, Pričesna...)',
  fieldMassSectionHint: 'Odaberite s popisa ili upišite vlastiti dio mise',
  fieldSubmitterName: 'Vaše ime',
  fieldSubmitterNamePlaceholder: 'npr., Ivan Horvat',
  fieldSubmitterEmail: 'Vaša e-pošta',
  fieldSubmitterEmailPlaceholder: 'npr., ivan@primjer.hr',
  fieldNotes: 'Napomene ili podaci o autoru',
  fieldNotesPlaceholder: 'npr., autor, tonalitet ili posebne upute',
  requiredMark: '*',
  optionalMark: '(neobavezno)',
  cancelBtn: 'Odustani',
  sendRequestBtn: 'Pošalji zahtjev za pjesmu',
  sendingRequestBtn: 'Slanje zahtjeva...',
  requestSentAlertTitle: 'Zahtjev poslan!',
  requestFailedAlertTitle: 'Neuspješno slanje',
  requestTitleRequiredError: 'Naslov pjesme je obavezan.',
  requestLyricsRequiredError: 'Stihovi pjesme su obavezni.',

  // Song Lyrics Modal
  lyricsModalTitle: 'Pregled stihova',
  stanzaLabel: (index: number) => `Strofa ${index}`,
  copyLyricsBtn: 'Kopiraj stihove',
  lyricsCopiedNotice: 'Stihovi kopirani u međuspremnik!',
  closeBtn: 'Zatvori',
  clickToViewLyricsHint: 'Kliknite za pregled cjelovitih stihova',
  addToPlaylistBtn: 'Dodaj u listu',
  addedToPlaylistBtn: (count: number) => `Dodano u listu (${count})`,

  // Settings Drawer
  settingsBtn: 'Postavke prezentacije',
  settingsTitle: 'Postavke prezentacije',
  settingsSubtitle: 'Prilagodite omjer stranica, fontove, boje i logotip slajdova',
  aspectRatioSection: 'Format & Omjer slike',
  aspectRatio169Label: '16:9 Široki zaslon',
  aspectRatio43Label: '4:3 Standardni projektor',
  blankSlidesSection: 'Prijelazni slajdovi',
  blankSlideBetweenSongsLabel: 'Prazan crni slajd između različitih pjesama',
  blankSlideStartEndLabel: 'Uvodni i završni prazan crni slajd',
  typographySection: 'Glavni tekst pjesme & Boje',
  fontFamilyLabel: 'Vrsta fonta',
  fontSizeLabel: 'Veličina fonta',
  autoFontSizeLabel: 'Automatsko prilagođavanje (32–44pt)',
  customFontSizeLabel: 'Fiksna veličina fonta',
  textColorLabel: 'Boja teksta',
  backgroundColorLabel: 'Boja pozadine slajda',
  sideTitleSection: 'Bočni naslov pjesme',
  showSideTitleLabel: 'Prikaži vertikalni naslov uz desni rub slajda',
  sideTitleFontLabel: 'Font bočnog naslova',
  sideTitleSizeLabel: 'Veličina fonta bočnog naslova',
  sideTitleOffsetLabel: 'Vodoravni odmak od ruba',
  logoSection: 'SKAC logotip u kutu',
  showLogoLabel: 'Prikaži SKAC logotip u donjem desnom kutu',
  logoSizeLabel: 'Veličina logotipa',
  logoTransparencyLabel: 'Prozirnost logotipa',
  resetSettingsBtn: 'Vrati na zadano',
  closeSettingsBtn: 'Zatvori',
  previewSection: 'Pregled izgleda slajda'
};

const TRANSLATIONS_EN: Translations = {
  // Header
  appTitle: 'PPTX Lyrics Maker',
  appSubtitle: 'Widescreen Presentation Generator',
  songsAvailable: (count: number) => `${count} ${count === 1 ? 'Song' : 'Songs'} Available`,
  requestNewSongBtn: 'Request New Song',
  langToggleTitle: 'Switch language (Croatian / English)',

  // Catalog
  catalogTitle: 'Song Catalog',
  searchPlaceholder: 'Search by title or lyrics...',
  clearSearch: 'Clear search input',
  showingSongsCounter: (shown: number, total: number) => `${shown} of ${total}`,
  loadingCatalog: 'Loading song repository...',
  noSongsFoundTitle: 'No songs found',
  noSongsFoundDesc: (query: string) => `No results match "${query}"`,
  catalogEmptyDesc: 'The song repository is currently empty.',
  clearSearchBtn: 'Clear Search',
  slidesCount: (count: number) => `${count} ${count === 1 ? 'Slide' : 'Slides'}`,
  addBtn: 'Add',
  addedBtn: (count: number) => `Added (${count})`,
  lyricPreviewHint: 'Lyric preview',
  categoriesLabel: 'Categories',
  massSectionsLabel: 'Mass Sections',
  filterByCategory: 'Filter by Category',
  filterByMassSection: 'Filter by Mass Section',
  filterAllCategories: 'All Categories',
  filterAllMassSections: 'All Mass Sections',
  clearFiltersBtn: 'Clear Filters',
  activeFiltersLabel: (count: number) => `${count} active filters`,

  // Playlist Queue
  queueTitle: 'Presentation Playlist',
  clearAllBtn: 'Clear All',
  selectedSongsMetric: 'Selected Songs',
  lyricSlidesMetric: 'Lyric Slides',
  estTotalSlidesMetric: 'Est. Total Slides',
  emptyQueueTitle: 'Presentation Queue is Empty',
  emptyQueueDesc: 'Select songs from the catalog on the left by clicking "+ Add" to build your PowerPoint slide deck.',
  moveUpTooltip: 'Move Up in presentation order',
  moveDownTooltip: 'Move Down in presentation order',
  removeTooltip: 'Remove from playlist',
  blankTransitionTag: '+ 1 Blank Transition',
  exportPresentationBtn: 'Generate & Download Presentation (.pptx)',
  generatingPresentationBtn: 'Generating PowerPoint Presentation...',
  presentationSettingsHint: '16:9 Widescreen • Solid Black Background • White Bold Verdana',
  exportSuccessMsg: (filename: string) => `Successfully generated "${filename}"!`,
  exportErrorEmpty: 'Playlist is empty. Please select at least one song.',
  exportErrorGeneric: 'Failed to generate PowerPoint file.',

  // Request Modal
  modalTitle: 'Request a New Song',
  modalSubtitle: (email: string) => `Submit song details to send a request to`,
  modalCloseTooltip: 'Close (ESC)',
  fieldSongTitle: 'Song Title',
  fieldSongTitlePlaceholder: 'e.g., Amazing Grace, 10,000 Reasons',
  fieldLyrics: 'Lyrics',
  fieldLyricsHint: 'Separate stanzas by empty lines for slides',
  fieldLyricsPlaceholder: 'Enter or paste lyrics here...\n\nSeparate each verse and chorus with a blank line to divide into presentation slides.',
  fieldCategory: 'Category',
  fieldCategoryPlaceholder: 'Select or type category (e.g. Praise & Worship, Thanksgiving...)',
  fieldCategoryHint: 'Select from preset list or type a custom category',
  fieldMassSection: 'Mass Section',
  fieldMassSectionPlaceholder: 'Select or type mass section (e.g. Entrance, Communion...)',
  fieldMassSectionHint: 'Select from preset list or type a custom mass section',
  fieldSubmitterName: 'Your Name',
  fieldSubmitterNamePlaceholder: 'e.g., John Doe',
  fieldSubmitterEmail: 'Your Email',
  fieldSubmitterEmailPlaceholder: 'e.g., name@example.com',
  fieldNotes: 'Notes or Author Info',
  fieldNotesPlaceholder: 'e.g., Christian praise hymn, artist/key info',
  requiredMark: '*',
  optionalMark: '(optional)',
  cancelBtn: 'Cancel',
  sendRequestBtn: 'Send Song Request',
  sendingRequestBtn: 'Sending Request...',
  requestSentAlertTitle: 'Request Sent!',
  requestFailedAlertTitle: 'Submission Failed',
  requestTitleRequiredError: 'Song title is required.',
  requestLyricsRequiredError: 'Song lyrics are required.',

  // Song Lyrics Modal
  lyricsModalTitle: 'Song Lyrics Preview',
  stanzaLabel: (index: number) => `Stanza ${index}`,
  copyLyricsBtn: 'Copy Lyrics',
  lyricsCopiedNotice: 'Lyrics copied to clipboard!',
  closeBtn: 'Close',
  clickToViewLyricsHint: 'Click to view full lyrics',
  addToPlaylistBtn: 'Add to presentation',
  addedToPlaylistBtn: (count: number) => `In presentation (${count})`,

  // Settings Drawer
  settingsBtn: 'Presentation Settings',
  settingsTitle: 'Presentation Settings',
  settingsSubtitle: 'Customize aspect ratio, typography, colors, and watermark',
  aspectRatioSection: 'Format & Aspect Ratio',
  aspectRatio169Label: '16:9 Widescreen',
  aspectRatio43Label: '4:3 Standard Projector',
  blankSlidesSection: 'Slide Transitions',
  blankSlideBetweenSongsLabel: 'Blank black slide between distinct songs',
  blankSlideStartEndLabel: 'Intro and outro blank black slides',
  typographySection: 'Lyrics Typography & Colors',
  fontFamilyLabel: 'Font Family',
  fontSizeLabel: 'Font Size',
  autoFontSizeLabel: 'Auto-fit sizing (32–44pt)',
  customFontSizeLabel: 'Fixed font size',
  textColorLabel: 'Text Color',
  backgroundColorLabel: 'Slide Background Color',
  sideTitleSection: 'Side Song Title',
  showSideTitleLabel: 'Show vertical song title along right edge',
  sideTitleFontLabel: 'Side Title Font',
  sideTitleSizeLabel: 'Side Title Font Size',
  sideTitleOffsetLabel: 'Horizontal offset from edge',
  logoSection: 'Corner SKAC Watermark',
  showLogoLabel: 'Show SKAC logo in bottom-right corner',
  logoSizeLabel: 'Logo Size',
  logoTransparencyLabel: 'Logo Transparency',
  resetSettingsBtn: 'Reset to Defaults',
  closeSettingsBtn: 'Close',
  previewSection: 'Live Slide Preview'
};

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly STORAGE_KEY = 'pptx_maker_lang';

  // Current active language (defaults to Croatian 'hr')
  readonly currentLang = signal<Language>(this.getInitialLanguage());

  // Reactive computed translation bundle
  readonly t = computed<Translations>(() => {
    return this.currentLang() === 'hr' ? TRANSLATIONS_HR : TRANSLATIONS_EN;
  });

  readonly isCroatian = computed<boolean>(() => this.currentLang() === 'hr');
  readonly isEnglish = computed<boolean>(() => this.currentLang() === 'en');

  /**
   * Set specific language ('hr' or 'en')
   */
  setLanguage(lang: Language): void {
    this.currentLang.set(lang);
    try {
      localStorage.setItem(this.STORAGE_KEY, lang);
    } catch {
      // Storage access may be restricted in sandboxed iframes
    }
  }

  /**
   * Toggle between Croatian and English
   */
  toggleLanguage(): void {
    const nextLang: Language = this.currentLang() === 'hr' ? 'en' : 'hr';
    this.setLanguage(nextLang);
  }

  private getInitialLanguage(): Language {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY) as Language | null;
      if (saved === 'hr' || saved === 'en') {
        return saved;
      }
    } catch {
      // Ignore storage errors
    }
    // Default to Croatian as primary language
    return 'hr';
  }
}

