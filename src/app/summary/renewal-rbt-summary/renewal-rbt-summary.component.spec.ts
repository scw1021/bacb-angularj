import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RenewalRbtSummaryComponent } from './renewal-rbt-summary.component';

describe('RenewalRbtSummaryComponent', () => {
  let component: RenewalRbtSummaryComponent;
  let fixture: ComponentFixture<RenewalRbtSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RenewalRbtSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenewalRbtSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
