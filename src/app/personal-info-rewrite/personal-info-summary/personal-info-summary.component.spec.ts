import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalInfoSummaryComponent } from './personal-info-summary.component';

describe('PersonalInfoSummaryComponent', () => {
  let component: PersonalInfoSummaryComponent;
  let fixture: ComponentFixture<PersonalInfoSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonalInfoSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalInfoSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
