import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CertCycleSummaryComponent } from './cert-cycle-summary.component';

describe('CertCycleSummaryComponent', () => {
  let component: CertCycleSummaryComponent;
  let fixture: ComponentFixture<CertCycleSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CertCycleSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CertCycleSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
