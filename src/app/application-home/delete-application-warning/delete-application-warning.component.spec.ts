import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteApplicationWarningComponent } from './delete-application-warning.component';

describe('DeleteApplicationWarningComponent', () => {
  let component: DeleteApplicationWarningComponent;
  let fixture: ComponentFixture<DeleteApplicationWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteApplicationWarningComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteApplicationWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
