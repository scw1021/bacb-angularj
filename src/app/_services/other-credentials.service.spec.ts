import { TestBed } from '@angular/core/testing';

import { OtherCredentialsService } from './other-credentials.service';

describe('OtherCredentialsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OtherCredentialsService = TestBed.get(OtherCredentialsService);
    expect(service).toBeTruthy();
  });
});
