import { TestBed } from '@angular/core/testing';

import { RbtApplicationService } from './rbt-application.service';

describe('RbtApplicationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RbtApplicationService = TestBed.get(RbtApplicationService);
    expect(service).toBeTruthy();
  });
});
