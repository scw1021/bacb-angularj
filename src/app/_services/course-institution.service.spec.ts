import { TestBed } from '@angular/core/testing';

import { CourseInstitutionService } from './course-institution.service';

describe('CourseInstitutionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CourseInstitutionService = TestBed.get(CourseInstitutionService);
    expect(service).toBeTruthy();
  });
});
