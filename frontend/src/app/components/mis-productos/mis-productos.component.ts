import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';  // Asegúrate de que el servicio esté correctamente importado
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-mis-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule, NavbarComponent],
  templateUrl: './mis-productos.component.html',
  styleUrls: ['./mis-productos.component.css'] // Corrige 'styleUrl' a 'styleUrls'
})
export class MisProductosComponent implements OnInit {
  productos: any[] = [];
  filteredProductos: any[] = [];
  searchTerm: string = '';
  usuario: any = null;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuario = JSON.parse(usuarioGuardado);

      this.productService.getProductsByUser(this.usuario._id).subscribe(
        (data: any) => {
          this.productos = data;
          this.filteredProductos = data;  // Inicialmente, todos los productos se muestran
        },
        (error) => {
          console.error('Error al obtener los productos:', error);
        }
      );
    }
  }

  formatPrice(precio: number): string {
    // Formatea el precio con separadores de miles y sin decimales
    return `$${precio.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }


  // Método auxiliar para obtener la URL de la foto
  getFotoUrl(foto: string): string {
    return `http://localhost:4000/uploads/${foto}`;  // Asegúrate de usar la URL correcta del servidor
  }


  onEdit(producto: any): void {
    Swal.fire({
      title: 'Editar producto',
      text: `Función para editar el producto: ${producto.titulo}`,
      icon: 'info'
    });
  }

  onDelete(producto: any): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar el producto "${producto.titulo}"? ¡Esta acción no se puede deshacer!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.eliminarProducto(producto._id).subscribe(
          () => {
            // Eliminar el producto de la lista local de productos
            this.productos = this.productos.filter(p => p._id !== producto._id);
            this.filteredProductos = this.filteredProductos.filter(p => p._id !== producto._id);  // Asegurar que la lista filtrada también se actualice

            Swal.fire(
              'Eliminado',
              'El producto y sus fotos han sido eliminados correctamente.',
              'success'
            );
          },
          (error) => {
            console.error('Error al eliminar el producto:', error);
            Swal.fire(
              'Error',
              'Hubo un problema al eliminar el producto.',
              'error'
            );
          }
        );
      }
    });
  }

  filterProductos(): void {
    this.filteredProductos = this.productos.filter(producto =>
      producto.titulo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
