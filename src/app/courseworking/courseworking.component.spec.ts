import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseworkingComponent } from './courseworking.component';

describe('CourseworkingComponent', () => {
  let component: CourseworkingComponent;
  let fixture: ComponentFixture<CourseworkingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseworkingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseworkingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
