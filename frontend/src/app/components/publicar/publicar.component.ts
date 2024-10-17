import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AfterViewChecked, Component, NgZone, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "../navbar/navbar.component";
import { CiudadesService } from '../../services/ciudades.service';
import { ProductService } from '../../services/product.service';  // Importa el servicio de productos
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-publicar',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule, NavbarComponent],
  templateUrl: './publicar.component.html',
  styleUrls: ['./publicar.component.css']
})
export class PublicarComponent implements OnInit, AfterViewChecked {
  productTitle = '';
  productPrice: string = '$ 0'; // Formato para el precio en texto
  productDescription = '';
  productType = '';
  photos: File[] = [];
  ciudades: any[] = [];
  ciudadSeleccionada: string = '';
  cantidadDisponible: number = 1;
  estadoProducto: string = 'disponible';
  usuario: any = null;  // Variable para almacenar los datos del usuario

  constructor(private ciudadesService: CiudadesService, private productService: ProductService, private cdr: ChangeDetectorRef, private zone: NgZone) { }

  ngOnInit(): void {
    // Recuperar el usuario desde localStorage
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuario = JSON.parse(usuarioGuardado);  // Asignar el usuario
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

  ngAfterViewChecked() {
    this.cdr.detectChanges();  // Esto fuerza la detección de cambios y debería evitar el error
  }

  // Eliminar fotos
  removePhoto(photo: File) {
    this.photos = this.photos.filter(p => p !== photo);  // Eliminar el archivo (File object) del array
  }

  createImagePreview(photo: File): string {
    return URL.createObjectURL(photo);  // Crear una URL temporal para previsualizar la imagen
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

  // Método para manejar el envío del formulario
  onSubmit() {
    const formData = new FormData();
    formData.append('titulo', this.productTitle);
    formData.append('descripcion', this.productDescription);
    formData.append('tipo', this.productType);
    // Enviar el precio sin formato de moneda
    formData.append('precio', this.unformatCurrency(this.productPrice).toString());
    formData.append('cantidadDisponible', this.cantidadDisponible.toString());
    formData.append('ciudad', this.ciudadSeleccionada);
    formData.append('estado', this.estadoProducto);
    formData.append('usuarioId', this.usuario._id);

    // Añadir los archivos al FormData
    for (let i = 0; i < this.photos.length; i++) {
      formData.append('fotos', this.photos[i]);  // Aquí los archivos son de tipo File
    }

    this.productService.crearProducto(formData).subscribe(
      (response) => {
        console.log('Producto creado:', response);
        Swal.fire({
          title: 'Producto creado',
          text: 'El producto ha sido publicado exitosamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.resetForm();
        });
      },
      (error) => {
        console.error('Error al crear el producto:', error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al publicar el producto.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    );
  }

  resetForm() {
    this.productTitle = '';
    this.productPrice = '$ 0';
    this.productDescription = '';
    this.productType = '';
    this.photos = [];
    this.ciudadSeleccionada = '';
    this.cantidadDisponible = 1;
    this.estadoProducto = 'disponible';
  }
}
