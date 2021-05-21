import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisorSelectorComponent } from './supervisor-selector.component';

describe('SupervisorSelectorComponent', () => {
  let component: SupervisorSelectorComponent;
  let fixture: ComponentFixture<SupervisorSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupervisorSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupervisorSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
