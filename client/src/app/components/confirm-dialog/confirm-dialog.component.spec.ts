import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default title', () => {
    expect(component.title).toBe('Confirm');
  });

  it('should have default message', () => {
    expect(component.message).toBe('Are you sure?');
  });

  it('should display custom title', () => {
    component.title = 'Delete Product';
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.dialog-title');
    expect(title.textContent).toBe('Delete Product');
  });

  it('should display custom message', () => {
    component.message = 'Are you sure you want to delete this item?';
    fixture.detectChanges();
    const message = fixture.nativeElement.querySelector('.dialog-body p');
    expect(message.textContent).toBe('Are you sure you want to delete this item?');
  });

  it('should emit confirm event on confirm button click', () => {
    spyOn(component.confirm, 'emit');
    component.onConfirm();
    expect(component.confirm.emit).toHaveBeenCalled();
  });

  it('should emit cancel event on cancel button click', () => {
    spyOn(component.cancel, 'emit');
    component.onCancel();
    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('should apply btn-danger class when isDestructive is true', () => {
    component.isDestructive = true;
    fixture.detectChanges();
    const confirmBtn = fixture.nativeElement.querySelector('.btn-danger');
    expect(confirmBtn).toBeTruthy();
  });

  it('should apply btn-primary class when isDestructive is false', () => {
    component.isDestructive = false;
    fixture.detectChanges();
    const confirmBtn = fixture.nativeElement.querySelector('.btn-primary');
    expect(confirmBtn).toBeTruthy();
  });

  it('should close on backdrop click', () => {
    spyOn(component.cancel, 'emit');
    const backdrop = fixture.nativeElement.querySelector('.modal-backdrop');
    backdrop.click();
    expect(component.cancel.emit).toHaveBeenCalled();
  });
});
