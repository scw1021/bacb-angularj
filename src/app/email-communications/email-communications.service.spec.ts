import { TestBed } from '@angular/core/testing';

import { EmailCommunicationsService } from './email-communications.service';

describe('EmailCommunicationsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EmailCommunicationsService = TestBed.get(EmailCommunicationsService);
    expect(service).toBeTruthy();
  });
});
