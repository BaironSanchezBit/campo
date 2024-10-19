import { Component, OnInit, Input } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FooterComponent } from "../footer/footer.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { PedidoService } from '../../services/pedido.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pedidos-vendedor',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, HttpClientModule, RouterModule, FooterComponent],
  templateUrl: './pedidos-vendedor.component.html',
  styleUrls: ['./pedidos-vendedor.component.css']
})
export class PedidosVendedorComponent implements OnInit {
  pedidos: any[] = [];
  vendedorId: string | null = null; // ID del vendedor autenticado

  constructor(
    private pedidoService: PedidoService,
    private authService: AuthService  // Inyectar AuthService para obtener el ID del vendedor
  ) { }

  ngOnInit() {
    this.vendedorId = this.authService.obtenerUsuarioId(); // Obtener el vendedorId del servicio de autenticación
    if (this.vendedorId) {
      this.obtenerPedidos(); // Llamar a la función para obtener los pedidos del vendedor
    } else {
      console.error('Vendedor no autenticado');
    }
  }

  obtenerPedidos() {
    this.pedidoService.obtenerPedidosVendedor(this.vendedorId!).subscribe(
      (response) => {
        this.pedidos = response.sort((a: any, b: any) => a.estadoGeneral === 'entregado' ? 1 : -1); // Ordenar los pedidos
      },
      (error) => {
        console.error('Error al obtener los pedidos del vendedor', error);
      }
    );
  }

  cambiarEstadoProducto(pedidoId: number, productoId: any, nuevoEstado: string) {
    // Verificar que el productoId sea una cadena
    const productoIdString = productoId._id ? productoId._id : productoId; // Extraer el ID si es un objeto

    // Asegurarte de enviar solo el estado "en camino"
    if (nuevoEstado !== 'Camino a la empresa transportadora') {
      console.warn('Solo se permite el estado "en camino" para los vendedores');
      return;
    }

    // Enviar la solicitud al backend
    this.pedidoService.actualizarEstadoProducto(pedidoId, productoIdString, nuevoEstado).subscribe(
      (response) => {
        console.log('Estado del producto actualizado:', response);
        this.obtenerPedidos(); // Recargar los pedidos para reflejar cambios
      },
      (error) => {
        console.error('Error al actualizar el estado del producto:', error);
      }
    );
  }

  formatCurrency(value: number): string {
    return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'creado':
        return 'text-red-500';
      case 'procesado':
        return 'text-yellow-500';
      case 'enviado a la empresa transportadora':
        return 'text-blue-500';
      case 'en camino':
        return 'text-orange-500';
      case 'entregado':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  }
}
