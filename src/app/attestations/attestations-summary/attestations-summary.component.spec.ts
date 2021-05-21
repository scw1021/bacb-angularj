import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttestationsSummaryComponent } from './attestations-summary.component';

describe('AttestationsSummaryComponent', () => {
  let component: AttestationsSummaryComponent;
  let fixture: ComponentFixture<AttestationsSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttestationsSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttestationsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
