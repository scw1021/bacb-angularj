import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachingCourseworkFormComponent } from './teaching-coursework-form.component';

describe('TeachingCourseworkFormComponent', () => {
  let component: TeachingCourseworkFormComponent;
  let fixture: ComponentFixture<TeachingCourseworkFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeachingCourseworkFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeachingCourseworkFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
