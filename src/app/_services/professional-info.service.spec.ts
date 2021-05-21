import { TestBed } from '@angular/core/testing';

import { ProfessionalInfoService } from './professional-info.service';

describe('ProfessionalInfoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProfessionalInfoService = TestBed.get(ProfessionalInfoService);
    expect(service).toBeTruthy();
  });
});
