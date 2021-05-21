import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisionManagementComponent } from './supervision-management.component';

describe('SupervisionManagementComponent', () => {
  let component: SupervisionManagementComponent;
  let fixture: ComponentFixture<SupervisionManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupervisionManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupervisionManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
