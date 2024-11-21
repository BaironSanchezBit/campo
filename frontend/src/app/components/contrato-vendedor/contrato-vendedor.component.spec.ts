import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratoVendedorComponent } from './contrato-vendedor.component';

describe('ContratoVendedorComponent', () => {
  let component: ContratoVendedorComponent;
  let fixture: ComponentFixture<ContratoVendedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContratoVendedorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContratoVendedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
