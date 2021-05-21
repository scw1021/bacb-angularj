import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccommodationSummaryComponent } from './accommodation-summary.component';

describe('AccommodationSummaryComponent', () => {
  let component: AccommodationSummaryComponent;
  let fixture: ComponentFixture<AccommodationSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccommodationSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccommodationSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
