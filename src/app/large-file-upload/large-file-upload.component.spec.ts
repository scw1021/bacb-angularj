import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LargeFileUploadComponent } from './large-file-upload.component';

describe('LargeFileUploadComponent', () => {
  let component: LargeFileUploadComponent;
  let fixture: ComponentFixture<LargeFileUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LargeFileUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LargeFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
