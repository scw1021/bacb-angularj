import { TestBed } from '@angular/core/testing';

import { CzechServiceService } from './czech-service.service';

describe('CzechServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CzechServiceService = TestBed.get(CzechServiceService);
    expect(service).toBeTruthy();
  });
});
