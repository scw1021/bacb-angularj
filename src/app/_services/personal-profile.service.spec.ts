import { TestBed } from '@angular/core/testing';

import { PersonalProfileService } from './personal-profile.service';

describe('PersonalProfileService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PersonalProfileService = TestBed.get(PersonalProfileService);
    expect(service).toBeTruthy();
  });
});
