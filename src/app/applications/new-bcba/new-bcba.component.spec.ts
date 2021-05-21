import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewBcbaOption1Component } from './new-bcba-option1.component';

describe('NewBcbaOption1Component', () => {
  let component: NewBcbaOption1Component;
  let fixture: ComponentFixture<NewBcbaOption1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewBcbaOption1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewBcbaOption1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
