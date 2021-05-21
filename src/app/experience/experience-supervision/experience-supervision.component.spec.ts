import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisionComponent } from './experience-supervision.component';

describe('SupervisionComponent', () => {
  let component: SupervisionComponent;
  let fixture: ComponentFixture<SupervisionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupervisionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupervisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
