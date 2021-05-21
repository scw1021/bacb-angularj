import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoluntaryInactiveComponent } from './voluntary-inactive.component';

describe('VoluntaryInactiveComponent', () => {
  let component: VoluntaryInactiveComponent;
  let fixture: ComponentFixture<VoluntaryInactiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VoluntaryInactiveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VoluntaryInactiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
