import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BcabaComponent } from './bcaba.component';

describe('BcabaComponent', () => {
  let component: BcabaComponent;
  let fixture: ComponentFixture<BcabaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BcabaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BcabaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
