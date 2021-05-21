import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RbtComponent } from './rbt.component';

describe('RbtComponent', () => {
  let component: RbtComponent;
  let fixture: ComponentFixture<RbtComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RbtComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RbtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
