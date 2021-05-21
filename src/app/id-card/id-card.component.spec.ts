import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdCardComponent } from './id-card.component';

describe('IdCardComponent', () => {
  let component: IdCardComponent;
  let fixture: ComponentFixture<IdCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IdCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
