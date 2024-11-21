import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-auditar',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './auditar.component.html',
  styleUrl: './auditar.component.css'
})
export class AuditarComponent implements OnInit {
  vendedores: any[] = [];
  vendedoresFiltrados: any[] = [];
  terminoBusqueda: string = '';

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.obtenerVendedores();
  }

  obtenerVendedores() {
    this.authService.obtenerVendedoresParaVerificar().subscribe(
      (data) => {
        this.vendedores = data;
        this.vendedoresFiltrados = data; // Inicialmente todos los datos
      },
      (error) => {
        console.error('Error al obtener los vendedores:', error);
      }
    );
  }

  filtrarVendedores() {
    const termino = this.terminoBusqueda.toLowerCase();
    this.vendedoresFiltrados = this.vendedores.filter(
      (vendedor) =>
        vendedor.nombres.toLowerCase().includes(termino) ||
        vendedor.correo.toLowerCase().includes(termino)
    );
  }

  aprobarVendedor(id: string) {
    this.authService.actualizarEstadoVendedor(id, 'Aprobado').subscribe(
      (response) => {
        Swal.fire('Éxito', 'El vendedor ha sido aprobado.', 'success');
        this.vendedores = response.vendedores; // Actualiza la lista con los datos del backend
        this.vendedoresFiltrados = response.vendedores; // Asegura que la lista filtrada también se actualice
      },
      (error) => {
        console.error('Error al aprobar al vendedor:', error);
        Swal.fire('Error', 'No se pudo aprobar al vendedor.', 'error');
      }
    );
  }
  
  rechazarVendedor(id: string) {
    this.authService.actualizarEstadoVendedor(id, 'Rechazado').subscribe(
      (response) => {
        Swal.fire('Éxito', 'El vendedor ha sido rechazado.', 'success');
        this.vendedores = response.vendedores; // Actualiza la lista con los datos del backend
        this.vendedoresFiltrados = response.vendedores; // Asegura que la lista filtrada también se actualice
      },
      (error) => {
        console.error('Error al rechazar al vendedor:', error);
        Swal.fire('Error', 'No se pudo rechazar al vendedor.', 'error');
      }
    );
  }

  // Actualizar el estado localmente
  actualizarEstadoLocal(id: string, nuevoEstado: string) {
    const vendedor = this.vendedores.find((v) => v._id === id);
    if (vendedor) {
      vendedor.estado = nuevoEstado; // Actualiza el estado del vendedor
      this.filtrarVendedores(); // Aplica los filtros de búsqueda si están activos
    }
  }

  getDocumentoUrl(documento: string): string {
    return `https://arribaelcampo.store/uploads/${documento}`;
  }
}