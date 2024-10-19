import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidosVendedorComponent } from './pedidos-vendedor.component';

describe('PedidosVendedorComponent', () => {
  let component: PedidosVendedorComponent;
  let fixture: ComponentFixture<PedidosVendedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidosVendedorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PedidosVendedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
