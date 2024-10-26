// Lógica en el archivo TS
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PedidoService } from '../../services/pedido.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-transportador',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, HttpClientModule, RouterModule, FooterComponent],
  templateUrl: './transportador.component.html',
  styleUrls: ['./transportador.component.css']
})
export class TransportadorComponent implements OnInit {
  transportadorId: string = '123'; // Transportador de prueba
  pedidos: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService
  ) { }

  ngOnInit() {
    // Obtener el ID del transportador de la URL
    const id = this.route.snapshot.paramMap.get('id');

    if (id === this.transportadorId) { // Verificar si es el transportador de prueba
      this.obtenerPedidosPorTransportador(id);
    }
  }

  obtenerPedidosPorTransportador(id: string) {
    this.pedidoService.obtenerPedidosPorTransportador(id).subscribe(
      (response) => {
        this.pedidos = response;
        console.log(response); // Verifica los pedidos en la consola
      },
      (error) => {
        console.error('Error al obtener los pedidos asignados al transportador', error);
      }
    );
  }

  cambiarEstadoGeneral(pedidoId: number, nuevoEstado: string) {
    this.pedidoService.actualizarEstadoGeneral(pedidoId, nuevoEstado).subscribe(
      (response) => {
        console.log('Estado general del pedido actualizado:', response);
        this.obtenerPedidosPorTransportador(this.transportadorId); // Recargar pedidos para reflejar cambios
      },
      (error) => {
        console.error('Error al actualizar el estado general del pedido', error);
      }
    );
  }

  // Función para obtener la clase de color de estado de un producto
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

  // Función para obtener la clase de color de estado general de un pedido
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
