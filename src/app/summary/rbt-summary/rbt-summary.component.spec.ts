import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RbtSummaryComponent } from './rbt-summary.component';

describe('RbtSummaryComponent', () => {
  let component: RbtSummaryComponent;
  let fixture: ComponentFixture<RbtSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RbtSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RbtSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
