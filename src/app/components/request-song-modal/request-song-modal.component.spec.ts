import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RequestSongModalComponent } from './request-song-modal.component';
import { RequestSongService } from '../../services/request-song.service';

describe('RequestSongModalComponent', () => {
  let component: RequestSongModalComponent;
  let fixture: ComponentFixture<RequestSongModalComponent>;
  let requestService: RequestSongService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [RequestSongModalComponent, FormsModule],
      providers: [RequestSongService]
    }).compileComponents();

    fixture = TestBed.createComponent(RequestSongModalComponent);
    component = fixture.componentInstance;
    requestService = TestBed.inject(RequestSongService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the modal and render destination email', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.modal-title')?.textContent).toContain('Zatraži novu pjesmu');
    expect(compiled.querySelector('.modal-subtitle')?.textContent).toContain('lukajurkic1@gmail.com');
  });

  it('should disable submit button when required fields are empty', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const submitBtn = compiled.querySelector('.submit-btn') as HTMLButtonElement;
    expect(submitBtn.disabled).toBeTrue();

    // Fill only title
    component.form.title = 'Song Title';
    fixture.detectChanges();
    expect(submitBtn.disabled).toBeTrue();

    // Fill lyrics too
    component.form.lyrics = 'Song lyrics verse 1';
    fixture.detectChanges();
    expect(submitBtn.disabled).toBeFalse();
  });

  it('should call submitSongRequest on submit and show success alert', async () => {
    spyOn(requestService, 'submitSongRequest').and.returnValue(
      Promise.resolve({
        success: true,
        message: 'Your song request has been sent to lukajurkic1@gmail.com!'
      })
    );

    component.form.title = 'In Christ Alone';
    component.form.category = 'Slavljenje';
    component.form.massSection = 'Pričesna';
    component.form.lyrics = 'In Christ alone my hope is found';
    fixture.detectChanges();

    await component.onSubmit();
    fixture.detectChanges();

    expect(requestService.submitSongRequest).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'In Christ Alone',
        category: 'Slavljenje',
        massSection: 'Pričesna',
        lyrics: 'In Christ alone my hope is found'
      })
    );
    expect(component.successMessage()).toContain('lukajurkic1@gmail.com');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.alert-success')).toBeTruthy();
  });

  it('should show error alert when submission fails', async () => {
    spyOn(requestService, 'submitSongRequest').and.returnValue(
      Promise.reject(new Error('Network error'))
    );

    component.form.title = 'In Christ Alone';
    component.form.lyrics = 'In Christ alone my hope is found';
    fixture.detectChanges();

    await component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMessage()).toBe('Network error');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.alert-error')).toBeTruthy();
  });

  it('should emit close on close button click or Escape key', () => {
    spyOn(component.close, 'emit');

    const compiled = fixture.nativeElement as HTMLElement;
    const closeBtn = compiled.querySelector('.close-button') as HTMLButtonElement;
    closeBtn.click();
    expect(component.close.emit).toHaveBeenCalled();

    component.handleEscapeKey();
    expect(component.close.emit).toHaveBeenCalledTimes(2);
  });
});

