import { TestBed } from '@angular/core/testing';

import { TraderProfileService } from './trader-profile-service';

describe('TraderProfileService', () => {
  let service: TraderProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TraderProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
