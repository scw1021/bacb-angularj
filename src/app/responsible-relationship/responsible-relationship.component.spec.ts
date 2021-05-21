import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsibleRelationshipComponent } from './responsible-relationship.component';

describe('ResponsibleRelationshipComponent', () => {
  let component: ResponsibleRelationshipComponent;
  let fixture: ComponentFixture<ResponsibleRelationshipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResponsibleRelationshipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponsibleRelationshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
