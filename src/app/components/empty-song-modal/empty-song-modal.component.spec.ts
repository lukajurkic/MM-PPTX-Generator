import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { EmptySongModalComponent } from './empty-song-modal.component';
import { TranslationService } from '../../services/translation.service';

describe('EmptySongModalComponent', () => {
  let component: EmptySongModalComponent;
  let fixture: ComponentFixture<EmptySongModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptySongModalComponent, FormsModule],
      providers: [TranslationService]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptySongModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component with default values', () => {
    expect(component).toBeTruthy();
    expect(component.songTitle).toBe('Prazna pjesma');
    expect(component.slideCount).toBe(1);
  });

  it('should increment slideCount when increment button is clicked', () => {
    component.increment();
    expect(component.slideCount).toBe(2);

    // Max 50
    component.slideCount = 50;
    component.increment();
    expect(component.slideCount).toBe(50);
  });

  it('should decrement slideCount when decrement button is clicked', () => {
    component.slideCount = 3;
    component.decrement();
    expect(component.slideCount).toBe(2);

    // Min 1
    component.slideCount = 1;
    component.decrement();
    expect(component.slideCount).toBe(1);
  });

  it('should emit confirm event with valid title and count on submit', () => {
    spyOn(component.confirm, 'emit');

    component.songTitle = 'Instrumentalna meditacija';
    component.slideCount = 4;
    component.onSubmit();

    expect(component.confirm.emit).toHaveBeenCalledWith({
      title: 'Instrumentalna meditacija',
      slideCount: 4
    });
  });

  it('should fallback to default title if empty string entered', () => {
    spyOn(component.confirm, 'emit');

    component.songTitle = '   ';
    component.slideCount = 2;
    component.onSubmit();

    expect(component.confirm.emit).toHaveBeenCalledWith({
      title: 'Prazna pjesma',
      slideCount: 2
    });
  });

  it('should emit close event on close button or backdrop click', () => {
    spyOn(component.close, 'emit');

    component.onClose();
    expect(component.close.emit).toHaveBeenCalledTimes(1);

    const mockEvent = {
      target: 'backdrop',
      currentTarget: 'backdrop'
    } as unknown as MouseEvent;

    component.onBackdropClick(mockEvent);
    expect(component.close.emit).toHaveBeenCalledTimes(2);
  });

  it('should emit close on Escape keydown', () => {
    spyOn(component.close, 'emit');
    component.handleEscape();
    expect(component.close.emit).toHaveBeenCalled();
  });
});
