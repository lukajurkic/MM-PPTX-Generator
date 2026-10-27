import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HeaderComponent } from './header.component';
import { SongService } from '../../services/song.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let songService: SongService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, HttpClientTestingModule],
      providers: [SongService]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    songService = TestBed.inject(SongService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the header component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the application title in Croatian by default', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const titleEl = compiled.querySelector('.brand-title');
    expect(titleEl?.textContent).toContain('PPTX Izrađivač Pjesama');
  });

  it('should toggle language between HR and EN', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const langBtns = compiled.querySelectorAll('.lang-btn');
    const enBtn = langBtns[1] as HTMLButtonElement;
    enBtn.click();
    fixture.detectChanges();

    const titleEl = compiled.querySelector('.brand-title');
    expect(titleEl?.textContent).toContain('PPTX Lyrics Maker');
  });

  it('should reflect song count from SongService in the badge', () => {
    // Add mock song to service
    songService.addToPlaylist({
      id: 'test-song',
      title: 'Test Song',
      slug: 'test-song',
      fileName: 'Test Song.json',
      stanzaCount: 2,
      preview: 'Preview',
      categories: ['Slavljenje'],
      massSections: ['Ulazna'],
      stanzas: ['Stanza 1', 'Stanza 2']
    });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const badgeEl = compiled.querySelector('.song-count-badge');
    expect(badgeEl).toBeTruthy();
  });

  it('should render the application version badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const versionBadge = compiled.querySelector('.version-badge');
    expect(versionBadge).toBeTruthy();
    expect(versionBadge?.textContent).toMatch(/^v\d+\.\d+\.\d+/);
  });

  it('should emit openRequestModal event when the request button is clicked', () => {
    spyOn(component.openRequestModal, 'emit');

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('.request-btn') as HTMLButtonElement;
    expect(button).toBeTruthy();

    button.click();
    expect(component.openRequestModal.emit).toHaveBeenCalled();
  });
});

