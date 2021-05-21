import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContinuingEducationComponent } from './continuing-education.component';

describe('ContinuingEducationComponent', () => {
  let component: ContinuingEducationComponent;
  let fixture: ComponentFixture<ContinuingEducationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContinuingEducationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContinuingEducationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
