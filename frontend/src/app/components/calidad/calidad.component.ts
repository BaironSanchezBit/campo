import { Component, OnInit } from '@angular/core';
import { FooterComponent } from "../footer/footer.component";
import { NavbarComponent } from "../navbar/navbar.component";
import { ProductService } from '../../services/product.service'; // Asegúrate de importar el servicio correcto
import Swal from 'sweetalert2';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calidad',
  standalone: true,
  imports: [FooterComponent, NavbarComponent, HttpClientModule, FormsModule, CommonModule],
  templateUrl: './calidad.component.html',
  styleUrls: ['./calidad.component.css']
})
export class CalidadComponent implements OnInit {
  productosPendientes: any[] = [];
  mostrarModal: boolean = false;
  productoSeleccionado: any = null;
  razonRechazo: string = '';

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.cargarProductosPendientes();
  }

  cargarProductosPendientes(): void {
    this.productService.getProductosPendientes().subscribe(
      (productos: any[]) => {
        this.productosPendientes = productos;
      },
      (error) => {
        console.error('Error al cargar los productos pendientes:', error);
        Swal.fire('Error', 'Hubo un problema al cargar los productos pendientes.', 'error');
      }
    );
  }

  aprobarProducto(producto: any): void {
    this.productService.actualizarEstadoCalidad(producto._id, { estadoCalidad: 'aprobado' }).subscribe(
      () => {
        Swal.fire('Producto aprobado', 'El producto ha sido aprobado correctamente.', 'success');
        // Remover el producto de la lista local
        this.productosPendientes = this.productosPendientes.filter(p => p._id !== producto._id);
      },
      (error) => {
        console.error('Error al aprobar el producto:', error);
        Swal.fire('Error', 'Hubo un problema al aprobar el producto.', 'error');
      }
    );
  }

  rechazarProducto(): void {
    if (!this.razonRechazo.trim()) {
      Swal.fire('Error', 'Debes proporcionar una razón para rechazar el producto.', 'error');
      return;
    }

    console.log('Datos enviados al servidor:', {
      estadoCalidad: 'rechazado',
      razonRechazo: this.razonRechazo
    });

    this.productService.actualizarEstadoCalidad(this.productoSeleccionado._id, {
      estadoCalidad: 'rechazado',
      razonRechazo: this.razonRechazo
    }).subscribe(
      () => {
        Swal.fire('Producto rechazado', 'El producto ha sido rechazado con éxito.', 'success');
        this.productosPendientes = this.productosPendientes.filter(p => p._id !== this.productoSeleccionado._id);
        this.cerrarModal();
      },
      (error) => {
        console.error('Error al rechazar el producto:', error);
        Swal.fire('Error', 'Hubo un problema al rechazar el producto.', 'error');
        this.cerrarModal();
      }
    );
  }

  formatPrice(precio: number): string {
    return `$${precio.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  getFotoUrl(foto: string): string {
    return `https://arribaelcampo.store/uploads/${foto}`; // Ajusta esta URL según tu configuración de backend
  }

  abrirModalRechazo(producto: any): void {
    this.productoSeleccionado = producto;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.productoSeleccionado = null;
    this.razonRechazo = '';
    this.mostrarModal = false;
  }

}
