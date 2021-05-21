import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContinuingEducationSummaryComponent } from './continuing-education-summary.component';

describe('ContinuingEducationSummaryComponent', () => {
  let component: ContinuingEducationSummaryComponent;
  let fixture: ComponentFixture<ContinuingEducationSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContinuingEducationSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContinuingEducationSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
