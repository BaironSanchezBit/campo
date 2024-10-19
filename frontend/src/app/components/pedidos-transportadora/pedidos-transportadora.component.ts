import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FooterComponent } from "../footer/footer.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-pedidos-transportadora',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, HttpClientModule, RouterModule, FooterComponent],
  templateUrl: './pedidos-transportadora.component.html',
  styleUrls: ['./pedidos-transportadora.component.css']
})
export class PedidosTransportadoraComponent implements OnInit {
  pedidos: any[] = [];
  transportadores: any[] = []; // Lista de transportadores disponibles

  constructor(private pedidoService: PedidoService) { }

  ngOnInit() {
    this.obtenerPedidosEnviados();
    this.obtenerTransportadores(); // Lógica para obtener transportadores
  }

  obtenerPedidosEnviados() {
    this.pedidoService.obtenerPedidosEnviados().subscribe(
      (response) => {
        this.pedidos = response;
        console.log(response)
      },
      (error) => {
        console.error('Error al obtener los pedidos enviados', error);
      }
    );
  }

  obtenerTransportadores() {
    // Implementar lógica para obtener transportadores de la base de datos
    this.transportadores = [
      { _id: '123', nombre: 'Transportador 1' },
      { _id: '124', nombre: 'Transportador 2' },
      // Agrega más transportadores aquí
    ];
  }

  asignarTransportador(pedidoId: number, transportadorId: string) {
    this.pedidoService.asignarTransportador(pedidoId, transportadorId).subscribe(
      (response) => {
        console.log('Transportador asignado:', response);
        this.obtenerPedidosEnviados(); // Recargar los pedidos para reflejar cambios
      },
      (error) => {
        console.error('Error al asignar transportador:', error);
      }
    );
  }

  todosProductosEntregados(productos: any[]): boolean {
    return productos.every(producto => producto.estado === 'Entregado a empresa transportadora');
  }

  // Función para cambiar el estado de un producto
  cambiarEstadoProducto(pedidoId: number, productoId: string, nuevoEstado: string) {
    this.pedidoService.actualizarEstadoProductoTransportadora(pedidoId, productoId, nuevoEstado).subscribe(
      (response) => {
        console.log('Estado del producto actualizado:', response);
        this.obtenerPedidosEnviados(); // Recargar los pedidos para reflejar cambios
      },
      (error) => {
        console.error('Error al actualizar el estado del producto:', error);
      }
    );
  }

  // Función para obtener la clase de color de estado
  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'Creado':
        return 'text-red-500';
      case 'Camino a la empresa transportadora':
        return 'text-orange-500';
      case 'Entregado a empresa transportadora':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  }

  // Función para obtener la clase de color de estado
  getEstadoColor2(estado: string): string {
    switch (estado) {
      case 'Creado':
        return 'text-red-500';
      case 'Productos camino a la empresa transportadora':
        return 'text-orange-500';
      case 'Productos en la empresa transportadora':
        return 'text-blue-500';
      case 'Comprobando productos':
        return 'text-indigo-500';
      case 'Camino a tu dirección':
        return 'text-violet-500';
      case 'Entregado':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  }
}