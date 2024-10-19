import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidosTransportadoraComponent } from './pedidos-transportadora.component';

describe('PedidosTransportadoraComponent', () => {
  let component: PedidosTransportadoraComponent;
  let fixture: ComponentFixture<PedidosTransportadoraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidosTransportadoraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PedidosTransportadoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
