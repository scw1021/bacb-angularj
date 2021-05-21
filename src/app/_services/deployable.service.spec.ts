import { TestBed } from '@angular/core/testing';

import { DeployableService } from './deployable.service';

describe('DeployableService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DeployableService = TestBed.get(DeployableService);
    expect(service).toBeTruthy();
  });
});
