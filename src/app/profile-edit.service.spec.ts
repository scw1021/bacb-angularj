import { TestBed } from '@angular/core/testing';

import { ProfileEditService } from './profile-edit.service';

describe('ProfileEditService', () => {
  let service: ProfileEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfileEditService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
