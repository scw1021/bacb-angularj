import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperienceSummaryComponent } from './experience-summary.component';

describe('ExperienceSummaryComponent', () => {
  let component: ExperienceSummaryComponent;
  let fixture: ComponentFixture<ExperienceSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExperienceSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExperienceSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
