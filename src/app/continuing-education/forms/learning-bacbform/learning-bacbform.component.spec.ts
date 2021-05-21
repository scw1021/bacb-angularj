import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningBACBFormComponent } from './learning-bacbform.component';

describe('LearningBACBFormComponent', () => {
  let component: LearningBACBFormComponent;
  let fixture: ComponentFixture<LearningBACBFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearningBACBFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearningBACBFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
