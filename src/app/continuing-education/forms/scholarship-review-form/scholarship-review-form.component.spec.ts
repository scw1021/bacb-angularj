import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScholarshipReviewFormComponent } from './scholarship-review-form.component';

describe('ScholarshipReviewFormComponent', () => {
  let component: ScholarshipReviewFormComponent;
  let fixture: ComponentFixture<ScholarshipReviewFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScholarshipReviewFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScholarshipReviewFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
