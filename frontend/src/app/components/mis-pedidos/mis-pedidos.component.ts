import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FooterComponent } from "../footer/footer.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, HttpClientModule, RouterModule, FooterComponent],
  templateUrl: './mis-pedidos.component.html',
  styleUrls: ['./mis-pedidos.component.css']
})
export class MisPedidosComponent implements OnInit {
  pedidos: any[] = [];
  usuarioId: string | null = null; // Usuario autenticado

  constructor(
    private pedidoService: PedidoService,
    private authService: AuthService  // Inyectar AuthService
  ) { }

  ngOnInit() {
    this.usuarioId = this.authService.obtenerUsuarioId(); // Obtener el usuarioId del servicio de autenticación
    if (this.usuarioId) {
      this.obtenerPedidos(); // Llamar a la función para obtener los pedidos
    } else {
      console.error('Usuario no autenticado');
    }
  }

  obtenerPedidos() {
    this.pedidoService.getPedidosByUsuarioId(this.usuarioId!).subscribe(
      (response) => {
        this.pedidos = response.sort((a: any, b: any) => {
          // Mueve los pedidos entregados al final
          if (a.estadoGeneral === 'Entregado') return 1;
          if (b.estadoGeneral === 'Entregado') return -1;
          return 0;
        });
      },
      (error) => {
        console.error('Error al obtener los pedidos', error);
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
