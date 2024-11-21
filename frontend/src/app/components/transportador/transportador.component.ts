// Lógica en el archivo TS
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PedidoService } from '../../services/pedido.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-transportador',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, HttpClientModule, RouterModule, FooterComponent],
  templateUrl: './transportador.component.html',
  styleUrls: ['./transportador.component.css']
})
export class TransportadorComponent implements OnInit {
  transportadorId: any;
  pedidos: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private pedidoService: PedidoService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // Obtener el ID del transportador de la URL
    this.transportadorId = this.authService.obtenerUsuarioId();
    if (this.transportadorId) {
      console.log('ID del usuario logueado (transportador):', this.transportadorId);
      this.obtenerPedidosPorTransportador(this.transportadorId);
    } else {
      console.error('No se encontró un usuario logueado.');
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
    // Mostrar una alerta de carga
    Swal.fire({
      title: 'Actualizando estado...',
      text: `Cambiando estado a "${nuevoEstado}"`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.pedidoService.actualizarEstadoGeneral(pedidoId, nuevoEstado).subscribe(
      (response) => {
        // Cerrar la alerta de carga y mostrar un mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: 'Estado actualizado',
          text: `El pedido ha sido marcado como "${nuevoEstado}"`,
          timer: 2000,
          showConfirmButton: false
        });

        // Recargar los pedidos para reflejar cambios
        this.obtenerPedidosPorTransportador(this.transportadorId);
      },
      (error) => {
        console.error('Error al actualizar el estado general del pedido', error);

        // Mostrar un mensaje de error
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al actualizar el estado del pedido.',
        });
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
