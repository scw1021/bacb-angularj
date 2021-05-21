import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundCheckSummaryComponent } from './background-check-summary.component';

describe('BackgroundCheckSummaryComponent', () => {
  let component: BackgroundCheckSummaryComponent;
  let fixture: ComponentFixture<BackgroundCheckSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BackgroundCheckSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackgroundCheckSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
