import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [TranslationService]
    });
    service = TestBed.inject(TranslationService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with Croatian as primary language by default', () => {
    expect(service).toBeTruthy();
    expect(service.currentLang()).toBe('hr');
    expect(service.isCroatian()).toBeTrue();
    expect(service.isEnglish()).toBeFalse();
    expect(service.t().appTitle).toBe('PPTX Izrađivač Pjesama');
    expect(service.t().catalogTitle).toBe('Katalog pjesama');
    expect(service.t().queueTitle).toBe('Lista za prezentaciju');
  });

  it('should format Croatian plurals correctly for songs count', () => {
    expect(service.t().songsAvailable(1)).toBe('1 Pjesma dostupna');
    expect(service.t().songsAvailable(2)).toBe('2 Pjesme dostupne');
    expect(service.t().songsAvailable(4)).toBe('4 Pjesme dostupne');
    expect(service.t().songsAvailable(5)).toBe('5 Pjesama dostupno');
    expect(service.t().songsAvailable(10)).toBe('10 Pjesama dostupno');
  });

  it('should switch to English when setLanguage("en") is called', () => {
    service.setLanguage('en');
    expect(service.currentLang()).toBe('en');
    expect(service.isEnglish()).toBeTrue();
    expect(service.isCroatian()).toBeFalse();
    expect(service.t().appTitle).toBe('PPTX Lyrics Maker');
    expect(service.t().catalogTitle).toBe('Song Catalog');
    expect(service.t().queueTitle).toBe('Presentation Playlist');
  });

  it('should toggle between Croatian and English', () => {
    expect(service.currentLang()).toBe('hr');
    service.toggleLanguage();
    expect(service.currentLang()).toBe('en');
    service.toggleLanguage();
    expect(service.currentLang()).toBe('hr');
  });

  it('should persist selected language preference in localStorage', () => {
    service.setLanguage('en');
    expect(localStorage.getItem('pptx_maker_lang')).toBe('en');
  });
});
