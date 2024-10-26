import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';

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
  
  constructor(private http: HttpClient, private cartService: CartService) { }

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
    this.http.get('http://localhost:4000/api/productos').subscribe((data: any) => {
      // Filtrar productos con estado 'disponible' y tomar los últimos 6
      this.productos = data
        .filter((producto: any) => producto.estado === 'disponible') // Filtra los productos disponibles
        .slice(-6); // Obtiene los últimos 6 productos disponibles
    }, error => {
      console.error('Error al obtener productos:', error);
    });
  }
  

  getFotoUrl(foto: string): string {
    return `http://localhost:4000/uploads/${foto}`;
  }

  transform(value: number): string {
    return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  addToCart(producto: any) {
    this.cartService.addToCart(producto);
    alert('Producto agregado al carrito!');
  }
}
