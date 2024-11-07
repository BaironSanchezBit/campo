import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";
import { AuthService } from '../../services/auth.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './producto-detalle.component.html',
  styleUrl: './producto-detalle.component.css'
})
export class ProductoDetalleComponent implements OnInit {
  producto: any = null;
  fotos: string[] = [];
  fotoActualIndex: number = 0;
  mensajeNotificacion: string = '';
  mostrarNotificacion: boolean = false;

  constructor(
    private route: ActivatedRoute, private sharedService: SharedService,
    private http: HttpClient, private authService: AuthService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.obtenerProducto(productId);
    }
  }

  obtenerProducto(id: string): void {
    this.http.get(`https://arribaelcampo.store/api/productos/${id}`).subscribe(
      (data: any) => {
        this.producto = data;
        this.fotos = this.producto.fotos || [];
      },
      error => {
        console.error('Error al obtener el producto:', error);
      }
    );
  }

  cambiarFoto(index: number): void {
    if (index >= 0 && index < this.fotos.length) {
      this.fotoActualIndex = index;
    }
  }

  addToCart(producto: any) {
    if (!this.authService.isLoggedIn()) { // Verificar si el usuario está autenticado
      this.sharedService.activarAuthModal(); // Activar el modal de autenticación
      return;
    }

    this.cartService.addToCart(producto);
    this.mensajeNotificacion = 'Producto agregado al carrito!';
    this.mostrarNotificacion = true;

    // Oculta la notificación después de 2 segundos
    setTimeout(() => {
      this.mostrarNotificacion = false;
    }, 2000);
  }

  getFotoUrl(foto: string): string {
    return `https://arribaelcampo.store/uploads/${foto}`; // Ajusta la URL según tu ruta de almacenamiento de imágenes
  }

  transform(value: number): string {
    return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

}