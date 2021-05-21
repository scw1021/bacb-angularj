import { TestBed } from '@angular/core/testing';

import { ApplicationCompletionService } from './application-completion.service';

describe('ApplicationCompletionService', () => {
  let service: ApplicationCompletionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApplicationCompletionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
