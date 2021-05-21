import { TestBed } from '@angular/core/testing';

import { ContinuingEducationService } from './continuing-education.service';

describe('ContinuingEducationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContinuingEducationService = TestBed.get(ContinuingEducationService);
    expect(service).toBeTruthy();
  });
});
