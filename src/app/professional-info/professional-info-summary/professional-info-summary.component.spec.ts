import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionalInfoSummaryComponent } from './professional-info-summary.component';

describe('ProfessionalInfoSummaryComponent', () => {
  let component: ProfessionalInfoSummaryComponent;
  let fixture: ComponentFixture<ProfessionalInfoSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfessionalInfoSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfessionalInfoSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
