import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningEventFormComponent } from './learning-event-form.component';

describe('LearningEventFormComponent', () => {
  let component: LearningEventFormComponent;
  let fixture: ComponentFixture<LearningEventFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearningEventFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningEventFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
