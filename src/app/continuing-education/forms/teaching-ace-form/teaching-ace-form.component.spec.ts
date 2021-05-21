import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeachingAceFormComponent } from './teaching-ace-form.component';

describe('TeachingAceFormComponent', () => {
  let component: TeachingAceFormComponent;
  let fixture: ComponentFixture<TeachingAceFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeachingAceFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeachingAceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
