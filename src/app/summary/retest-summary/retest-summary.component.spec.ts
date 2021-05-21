import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetestSummaryComponent } from './retest-summary.component';

describe('RetestSummaryComponent', () => {
  let component: RetestSummaryComponent;
  let fixture: ComponentFixture<RetestSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetestSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetestSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
