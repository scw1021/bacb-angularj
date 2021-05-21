import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LargeFileUploadSummaryComponent } from './large-file-upload-summary.component';

describe('LargeFileUploadSummaryComponent', () => {
  let component: LargeFileUploadSummaryComponent;
  let fixture: ComponentFixture<LargeFileUploadSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LargeFileUploadSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LargeFileUploadSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
