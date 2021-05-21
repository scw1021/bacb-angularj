import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AltPaymentComponent } from './alt-payment.component';

describe('AltPaymentComponent', () => {
  let component: AltPaymentComponent;
  let fixture: ComponentFixture<AltPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AltPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AltPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
