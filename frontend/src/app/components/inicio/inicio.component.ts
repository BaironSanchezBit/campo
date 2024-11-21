import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent, FooterComponent, HttpClientModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
})
export class InicioComponent {
  usuario: any = null;  // Variable para almacenar los datos del usuario
  isLoggedIn = false;
  productos: any[] = [];
  mensajeNotificacion: string = '';
  mostrarNotificacion: boolean = false;
  
  constructor(private sharedService: SharedService, private authService: AuthService,private http: HttpClient, private cartService: CartService) { }

  ngOnInit(): void {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      this.usuario = JSON.parse(usuarioGuardado);
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }
    this.obtenerProductos();
  }

  obtenerProductos() {
    this.http.get('https://arribaelcampo.store/api/productos').subscribe((data: any) => {
      // Filtrar productos disponibles y aprobados
      this.productos = data.filter((producto: any) => 
        producto.estado === 'disponible' && producto.estadoCalidad === 'aprobado'
      );
    }, error => {
      console.error('Error al obtener productos:', error);
    });
  }

  getFotoUrl(foto: string): string {
    return `https://arribaelcampo.store/uploads/${foto}`;
  }

  transform(value: number): string {
    return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
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
}
