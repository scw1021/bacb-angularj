import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailCommunicationsComponent } from './email-communications.component';

describe('EmailCommunicationsComponent', () => {
  let component: EmailCommunicationsComponent;
  let fixture: ComponentFixture<EmailCommunicationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailCommunicationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailCommunicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
