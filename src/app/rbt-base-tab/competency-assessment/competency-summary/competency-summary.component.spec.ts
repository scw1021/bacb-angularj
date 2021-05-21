import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetencySummaryComponent } from './competency-summary.component';

describe('CompetencySummaryComponent', () => {
  let component: CompetencySummaryComponent;
  let fixture: ComponentFixture<CompetencySummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompetencySummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompetencySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
