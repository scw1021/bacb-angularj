import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalInfoRewriteComponent } from './personal-info-rewrite.component';

describe('PersonalInfoRewriteComponent', () => {
  let component: PersonalInfoRewriteComponent;
  let fixture: ComponentFixture<PersonalInfoRewriteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonalInfoRewriteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalInfoRewriteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
