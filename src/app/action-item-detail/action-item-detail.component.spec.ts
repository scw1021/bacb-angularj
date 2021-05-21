import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionItemDetailComponent } from './action-item-detail.component';

describe('ActionItemDetailComponent', () => {
  let component: ActionItemDetailComponent;
  let fixture: ComponentFixture<ActionItemDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionItemDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionItemDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
