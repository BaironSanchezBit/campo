import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "../navbar/navbar.component";
import { CiudadesService } from '../../services/ciudades.service';

@Component({
  selector: 'app-publicar',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule, NavbarComponent],
  templateUrl: './publicar.component.html',
  styleUrls: ['./publicar.component.css']
})
export class PublicarComponent implements OnInit {
  productTitle = '';
  productPrice = 0;
  productDescription = '';
  productType = '';
  photos: string[] = [];
  ciudades: any[] = [];  // Almacenar las ciudades obtenidas de la API
  ciudadSeleccionada: string = '';

  cantidadDisponible: number = 1;  // Cantidad de productos disponibles
  estadoProducto: string = 'disponible';  // Estado del producto

  constructor(private ciudadesService: CiudadesService) { }

  ngOnInit(): void {
    this.ciudadesService.getCiudades().subscribe(
      (data) => {
        this.ciudades = data;
        console.log('Ciudades cargadas:', this.ciudades);
      },
      (error) => {
        console.error('Error al cargar las ciudades', error);
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
        this.photos.push(e.target.result);
      };
      reader.readAsDataURL(files[i]);
    }
  }

  // Eliminar fotos
  removePhoto(photo: string) {
    this.photos = this.photos.filter(p => p !== photo);
  }
}
