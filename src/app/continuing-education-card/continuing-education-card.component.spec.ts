import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContinuingEducationCardComponent } from './continuing-education-card.component';

describe('ContinuingEducationCardComponent', () => {
  let component: ContinuingEducationCardComponent;
  let fixture: ComponentFixture<ContinuingEducationCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContinuingEducationCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContinuingEducationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
