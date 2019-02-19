import { TestBed } from '@angular/core/testing';

import { VegetableGroupService } from './vegetable-group.service';

describe('VegetableGroupService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VegetableGroupService = TestBed.get(VegetableGroupService);
    expect(service).toBeTruthy();
  });
});
