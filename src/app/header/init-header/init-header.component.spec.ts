import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InitHeaderComponent } from './init-header.component';

describe('InitHeaderComponent', () => {
  let component: InitHeaderComponent;
  let fixture: ComponentFixture<InitHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InitHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InitHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
