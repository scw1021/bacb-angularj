import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoluntaryInactiveSummaryComponent } from './voluntary-inactive-summary.component';

describe('VoluntaryInactiveSummaryComponent', () => {
  let component: VoluntaryInactiveSummaryComponent;
  let fixture: ComponentFixture<VoluntaryInactiveSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VoluntaryInactiveSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VoluntaryInactiveSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
