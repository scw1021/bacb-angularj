import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetencyAssessmentComponent } from './competency-assessment.component';

describe('CompetencyAssessmentComponent', () => {
  let component: CompetencyAssessmentComponent;
  let fixture: ComponentFixture<CompetencyAssessmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompetencyAssessmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompetencyAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
