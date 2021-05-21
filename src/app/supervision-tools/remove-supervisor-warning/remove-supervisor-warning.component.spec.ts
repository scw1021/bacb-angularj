import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveSupervisorWarningComponent } from './remove-supervisor-warning.component';

describe('RemoveSupervisorWarningComponent', () => {
  let component: RemoveSupervisorWarningComponent;
  let fixture: ComponentFixture<RemoveSupervisorWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemoveSupervisorWarningComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveSupervisorWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
