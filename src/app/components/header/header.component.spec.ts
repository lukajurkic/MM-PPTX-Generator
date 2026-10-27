import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HeaderComponent } from './header.component';
import { SongService } from '../../services/song.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let songService: SongService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, HttpClientTestingModule],
      providers: [SongService]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    songService = TestBed.inject(SongService);
    fixture.detectChanges();
  });

  it('should create the header component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the application title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const titleEl = compiled.querySelector('.brand-title');
    expect(titleEl?.textContent).toContain('PPTX Lyrics Maker');
  });

  it('should reflect song count from SongService in the badge', () => {
    // Add mock song to service
    songService.addToPlaylist({
      id: 'test-song',
      title: 'Test Song',
      slug: 'test-song',
      fileName: 'Test Song.txt',
      stanzaCount: 2,
      preview: 'Preview',
      stanzas: ['Stanza 1', 'Stanza 2']
    });

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const badgeEl = compiled.querySelector('.song-count-badge');
    expect(badgeEl).toBeTruthy();
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
