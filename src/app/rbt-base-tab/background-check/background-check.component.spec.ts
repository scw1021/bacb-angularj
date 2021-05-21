import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundCheckComponent } from './background-check.component';

describe('BackgroundCheckComponent', () => {
  let component: BackgroundCheckComponent;
  let fixture: ComponentFixture<BackgroundCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BackgroundCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackgroundCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
