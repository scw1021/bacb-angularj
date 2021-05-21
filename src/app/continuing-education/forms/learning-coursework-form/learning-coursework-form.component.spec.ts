import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningCourseworkFormComponent } from './learning-coursework-form.component';

describe('LearningCourseworkFormComponent', () => {
  let component: LearningCourseworkFormComponent;
  let fixture: ComponentFixture<LearningCourseworkFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearningCourseworkFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningCourseworkFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
