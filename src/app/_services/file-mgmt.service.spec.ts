import { TestBed } from '@angular/core/testing';

import { FileMgmtService } from './file-mgmt.service';

describe('FileMgmtService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FileMgmtService = TestBed.get(FileMgmtService);
    expect(service).toBeTruthy();
  });
});
