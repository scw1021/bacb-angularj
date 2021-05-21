import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RbtBaseTabComponent } from './rbt-base-tab.component';

describe('RbtBaseTabComponent', () => {
  let component: RbtBaseTabComponent;
  let fixture: ComponentFixture<RbtBaseTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RbtBaseTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RbtBaseTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
