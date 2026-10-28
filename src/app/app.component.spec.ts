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
    expect(footerEl?.textContent).toContain('SKAC Osijek');
    const versionEl = compiled.querySelector('.footer-version');
    expect(versionEl?.textContent).toMatch(/^v\d+\.\d+\.\d+/);
  });

  it('should open and close the settings drawer when requested', () => {
    expect(component.isSettingsDrawerOpen()).toBeFalse();

    component.onSettingsOpen();
    fixture.detectChanges();
    expect(component.isSettingsDrawerOpen()).toBeTrue();
    expect(fixture.nativeElement.querySelector('app-settings-drawer')).toBeTruthy();

    component.onSettingsClose();
    fixture.detectChanges();
    expect(component.isSettingsDrawerOpen()).toBeFalse();
    expect(fixture.nativeElement.querySelector('app-settings-drawer')).toBeFalsy();
  });

  it('should open settings drawer when playlist queue emits openSettings', () => {
    expect(component.isSettingsDrawerOpen()).toBeFalse();

    const compiled = fixture.nativeElement as HTMLElement;
    const playlistQueueStatusBtn = compiled.querySelector('app-playlist-queue .settings-status-btn') as HTMLButtonElement;
    expect(playlistQueueStatusBtn).toBeTruthy();

    playlistQueueStatusBtn.click();
    fixture.detectChanges();

    expect(component.isSettingsDrawerOpen()).toBeTrue();
    expect(compiled.querySelector('app-settings-drawer')).toBeTruthy();
  });
});


