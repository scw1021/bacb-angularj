import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FortyHourTrainingSummaryComponent } from './forty-hour-training-summary.component';

describe('FortyHourTrainingSummaryComponent', () => {
  let component: FortyHourTrainingSummaryComponent;
  let fixture: ComponentFixture<FortyHourTrainingSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FortyHourTrainingSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FortyHourTrainingSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
