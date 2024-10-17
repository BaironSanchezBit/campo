import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TendenciasAgriculturaSostenibleComponent } from './tendencias-agricultura-sostenible.component';

describe('TendenciasAgriculturaSostenibleComponent', () => {
  let component: TendenciasAgriculturaSostenibleComponent;
  let fixture: ComponentFixture<TendenciasAgriculturaSostenibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TendenciasAgriculturaSostenibleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TendenciasAgriculturaSostenibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
