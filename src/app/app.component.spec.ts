import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { SongService } from './services/song.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule],
      providers: [SongService]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the footer with version', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const footerEl = compiled.querySelector('.app-footer');
    expect(footerEl).toBeTruthy();
    expect(footerEl?.textContent).toContain('SKAC Palma');
    const versionEl = compiled.querySelector('.footer-version');
    expect(versionEl?.textContent).toMatch(/^v\d+\.\d+\.\d+/);
  });
});
