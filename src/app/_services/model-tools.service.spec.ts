import { TestBed } from '@angular/core/testing';

import { ModelToolsService } from './model-tools.service';

describe('ModelToolsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ModelToolsService = TestBed.get(ModelToolsService);
    expect(service).toBeTruthy();
  });
});
