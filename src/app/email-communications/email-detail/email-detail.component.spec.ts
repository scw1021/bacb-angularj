import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailDetailComponent } from './email-detail.component';

describe('EmailDetailComponent', () => {
  let component: EmailDetailComponent;
  let fixture: ComponentFixture<EmailDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
