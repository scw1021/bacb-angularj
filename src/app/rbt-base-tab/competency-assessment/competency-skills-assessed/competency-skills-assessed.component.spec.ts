import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetencySkillsAssessedComponent } from './competency-skills-assessed.component';

describe('CompetencySkillsAssessedComponent', () => {
  let component: CompetencySkillsAssessedComponent;
  let fixture: ComponentFixture<CompetencySkillsAssessedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompetencySkillsAssessedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompetencySkillsAssessedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
