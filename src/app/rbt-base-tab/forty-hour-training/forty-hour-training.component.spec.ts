import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FortyHourTrainingComponent } from './forty-hour-training.component';

describe('FortyHourTrainingComponent', () => {
  let component: FortyHourTrainingComponent;
  let fixture: ComponentFixture<FortyHourTrainingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FortyHourTrainingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FortyHourTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
