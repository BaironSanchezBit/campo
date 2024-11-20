import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';  // Asegúrate de que el servicio esté correctamente importado
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { NavbarComponent } from "../navbar/navbar.component";
import { CiudadesService } from '../../services/ciudades.service';

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
  existingPhotos: string[] = [];
  searchTerm: string = '';
  usuario: any = null;
  photos: File[] = [];
  ciudades: any[] = [];
  ciudadSeleccionada: string = '';
  cantidadDisponible: number = 1;
  productoSeleccionado: any = null;

  constructor(private ciudadesService: CiudadesService, private cdr: ChangeDetectorRef, private productService: ProductService, private zone: NgZone) { }

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


    this.ciudadesService.getCiudades().subscribe(
      (data) => {
        this.ciudades = data;
      },
      (error) => {
      }
    );
  }

  // Incrementar cantidad
  incrementCantidad() {
    if (this.cantidadDisponible < 50) {
      this.cantidadDisponible++;
    }
  }

  // Decrementar cantidad
  decrementCantidad() {
    if (this.cantidadDisponible > 1) {
      this.cantidadDisponible--;
    }
  }

  onEdit(producto: any): void {
    // Crear una copia para editar sin afectar el original
    this.productoSeleccionado = { ...producto };
    this.existingPhotos = [...producto.fotos];
    console.log(this.productoSeleccionado)
    // Agregar un campo formateado solo para mostrar
    this.productoSeleccionado.precioFormateado = this.formatPrice(producto.precio);
  }

  removeExistingPhoto(photo: string) {
    this.existingPhotos = this.existingPhotos.filter(p => p !== photo);
  }

  // Manejar la selección de archivos
  onFileSelected(event: any) {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photos.push(files[i]);

        this.zone.run(() => {
          this.cdr.markForCheck();
        });
      };
      reader.readAsDataURL(files[i]);
    }
  }

  // Eliminar fotos
  removePhoto(photo: File) {
    this.photos = this.photos.filter(p => p !== photo);  // Eliminar el archivo (File object) del array
  }

  createImagePreview(photo: File): string {
    return URL.createObjectURL(photo);  // Crear una URL temporal para previsualizar la imagen
  }

  onUpdateProduct(): void {
    if (this.productoSeleccionado) {
      const formData = new FormData();
      formData.append('titulo', this.productoSeleccionado.titulo);
      formData.append('descripcion', this.productoSeleccionado.descripcion);
      formData.append('tipo', this.productoSeleccionado.tipo);
      formData.append('precio', this.unformatCurrency(this.productoSeleccionado.precioFormateado).toString());
      formData.append('cantidadDisponible', this.productoSeleccionado.cantidadDisponible.toString());
      formData.append('ciudad', this.productoSeleccionado.ciudad);
      formData.append('estado', this.productoSeleccionado.estado);
  
      // Añadir imágenes existentes
      this.existingPhotos.forEach(photo => {
        formData.append('fotosExistentes', photo);
      });
  
      // Añadir nuevas imágenes seleccionadas
      this.photos.forEach(photo => {
        formData.append('nuevasFotos', photo);
      });
  
      this.productService.actualizarProducto(this.productoSeleccionado._id, formData).subscribe(
        () => {
          Swal.fire('Producto actualizado', 'El producto ha sido actualizado correctamente.', 'success');
          // Actualiza la lista de productos
          const index = this.productos.findIndex(p => p._id === this.productoSeleccionado._id);
          if (index !== -1) {
            this.productos[index] = { ...this.productoSeleccionado };
          }
  
          // Obtener productos actualizados
          this.productService.getProductsByUser(this.usuario._id).subscribe(
            (data: any) => {
              this.productos = data;
              this.filteredProductos = data;
            },
            (error) => {
              console.error('Error al obtener los productos:', error);
            }
          );
  
          // Limpiar el formulario y los arrays de imágenes
          this.productoSeleccionado = null; // Limpiar el formulario de edición
          this.photos = []; // Limpiar nuevas fotos seleccionadas
          this.existingPhotos = []; // Limpiar fotos existentes
        },
        (error) => {
          console.error('Error al actualizar el producto:', error);
          Swal.fire('Error', 'Hubo un problema al actualizar el producto.', 'error');
        }
      );
    }
  }

  cancelEdit(): void {
    // Cancelar la edición y limpiar el formulario
    this.productoSeleccionado = null;
  }

  formatPrice(precio: number): string {
    // Formatea el precio con separadores de miles y sin decimales
    return `$${precio.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  // Método auxiliar para obtener la URL de la foto
  getFotoUrl(foto: string): string {
    return `https://arribaelcampo.store/uploads/${foto}`;  // Asegúrate de usar la URL correcta del servidor
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

  // Formatear el valor de entrada como moneda
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
  }

  // Eliminar formato de moneda para convertir en número
  unformatCurrency(value: string): number {
    const numericValue = value.replace(/[^0-9,]/g, '').replace('.', '').replace(',', '.');
    return numericValue ? parseFloat(numericValue) : 0;
  }

  // Manejar la entrada de precios
  onCurrencyInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = this.unformatCurrency(inputElement.value);
    if (!isNaN(inputValue)) {
      const formattedValue = this.formatCurrency(inputValue);
      inputElement.value = formattedValue;
    } else {
      inputElement.value = '';
    }
  }
}
