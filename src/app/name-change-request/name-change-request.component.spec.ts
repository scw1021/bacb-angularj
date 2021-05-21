import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameChangeRequestComponent } from './name-change-request.component';

describe('NameChangeRequestComponent', () => {
  let component: NameChangeRequestComponent;
  let fixture: ComponentFixture<NameChangeRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NameChangeRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NameChangeRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
