import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationSummaryComponent } from './education-summary.component';

describe('EducationSummaryComponent', () => {
  let component: EducationSummaryComponent;
  let fixture: ComponentFixture<EducationSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EducationSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EducationSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
