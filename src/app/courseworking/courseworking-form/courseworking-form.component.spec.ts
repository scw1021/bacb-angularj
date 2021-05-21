import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseworkingFormComponent } from './courseworking-form.component';

describe('CourseworkingFormComponent', () => {
  let component: CourseworkingFormComponent;
  let fixture: ComponentFixture<CourseworkingFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseworkingFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseworkingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
