import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LargeFileUploadContainerComponent } from './large-file-upload-container.component';

describe('LargeFileUploadContainerComponent', () => {
  let component: LargeFileUploadContainerComponent;
  let fixture: ComponentFixture<LargeFileUploadContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LargeFileUploadContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LargeFileUploadContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
