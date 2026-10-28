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

  it('should toggle categories in multi-select dropdown and render chips', () => {
    expect(component.selectedCategories().length).toBe(0);

    // Toggle category
    component.toggleCategory('Slavljenje');
    expect(component.selectedCategories()).toEqual(['Slavljenje']);
    expect(component.isCategorySelected('Slavljenje')).toBeTrue();

    // Toggle another
    component.toggleCategory('Zahvala');
    expect(component.selectedCategories()).toEqual(['Slavljenje', 'Zahvala']);

    // Toggle existing removes it
    component.toggleCategory('Slavljenje');
    expect(component.selectedCategories()).toEqual(['Zahvala']);
    expect(component.isCategorySelected('Slavljenje')).toBeFalse();

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const chipText = compiled.querySelector('.selected-chips-container .chip-text');
    expect(chipText?.textContent).toBe('Zahvala');
  });

  it('should add custom category and place it into selected and available lists', () => {
    component.customCategoryInput = 'Nova Kategorija';
    component.addCustomCategory();

    expect(component.selectedCategories()).toContain('Nova Kategorija');
    expect(component.availableCategories()).toContain('Nova Kategorija');
    expect(component.customCategoryInput).toBe('');

    // Comma-separated custom categories
    component.customCategoryInput = 'Kategorija A, Kategorija B';
    component.addCustomCategory();

    expect(component.selectedCategories()).toContain('Kategorija A');
    expect(component.selectedCategories()).toContain('Kategorija B');
    expect(component.availableCategories()).toContain('Kategorija A');
    expect(component.availableCategories()).toContain('Kategorija B');
  });

  it('should toggle mass sections and add custom mass sections', () => {
    component.toggleMassSection('Ulazna');
    component.toggleMassSection('Pričesna');
    expect(component.selectedMassSections()).toEqual(['Ulazna', 'Pričesna']);

    component.removeMassSection('Ulazna');
    expect(component.selectedMassSections()).toEqual(['Pričesna']);

    component.customMassSectionInput = 'Završni blagoslov';
    component.addCustomMassSection();

    expect(component.selectedMassSections()).toEqual(['Pričesna', 'Završni blagoslov']);
    expect(component.availableMassSections()).toContain('Završni blagoslov');
    expect(component.customMassSectionInput).toBe('');
  });

  it('should close open dropdowns on escape key before closing modal', () => {
    spyOn(component.close, 'emit');

    component.isCategoryDropdownOpen.set(true);
    component.handleEscapeKey();

    expect(component.isCategoryDropdownOpen()).toBeFalse();
    expect(component.close.emit).not.toHaveBeenCalled();

    // Next escape key closes the modal
    component.handleEscapeKey();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should submit request with multi-selected categories and mass sections', async () => {
    spyOn(requestService, 'submitSongRequest').and.returnValue(
      Promise.resolve({
        success: true,
        message: 'Request sent'
      })
    );

    component.form.title = 'Krist na žalu';
    component.form.lyrics = 'Krist jednom stade na žalu';
    component.selectedCategories.set(['Slavljenje', 'Meditativne']);
    component.selectedMassSections.set(['Pričesna', 'Klanjanje']);

    await component.onSubmit();

    expect(requestService.submitSongRequest).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'Krist na žalu',
        lyrics: 'Krist jednom stade na žalu',
        categories: ['Slavljenje', 'Meditativne'],
        massSections: ['Pričesna', 'Klanjanje'],
        category: 'Slavljenje, Meditativne',
        massSection: 'Pričesna, Klanjanje'
      })
    );
  });
});

