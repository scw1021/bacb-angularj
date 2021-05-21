import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisorEligibilityComponent } from './supervisor-eligibility.component';

describe('SupervisorEligibilityComponent', () => {
  let component: SupervisorEligibilityComponent;
  let fixture: ComponentFixture<SupervisorEligibilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupervisorEligibilityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupervisorEligibilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
