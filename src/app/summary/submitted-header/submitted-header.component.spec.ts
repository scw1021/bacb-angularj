import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmittedHeaderComponent } from './submitted-header.component';

describe('SubmittedHeaderComponent', () => {
  let component: SubmittedHeaderComponent;
  let fixture: ComponentFixture<SubmittedHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmittedHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmittedHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
