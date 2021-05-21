import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupervisionToolsComponent } from './supervision-tools.component';

describe('SupervisionToolsComponent', () => {
  let component: SupervisionToolsComponent;
  let fixture: ComponentFixture<SupervisionToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SupervisionToolsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SupervisionToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
