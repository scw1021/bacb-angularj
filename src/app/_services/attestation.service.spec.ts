import { TestBed } from '@angular/core/testing';

import { AttestationService } from './attestation.service';

describe('AttestationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AttestationService = TestBed.get(AttestationService);
    expect(service).toBeTruthy();
  });
});
