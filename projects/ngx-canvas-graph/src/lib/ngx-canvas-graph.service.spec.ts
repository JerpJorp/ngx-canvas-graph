import { TestBed } from '@angular/core/testing';

import { NgxCanvasGraphService } from './ngx-canvas-graph.service';

describe('NgxCanvasGraphService', () => {
  let service: NgxCanvasGraphService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxCanvasGraphService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
