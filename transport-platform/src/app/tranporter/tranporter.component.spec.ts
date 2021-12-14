import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranporterComponent } from './tranporter.component';

describe('TranporterComponent', () => {
  let component: TranporterComponent;
  let fixture: ComponentFixture<TranporterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TranporterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TranporterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
