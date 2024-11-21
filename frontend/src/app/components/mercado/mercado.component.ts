import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { FooterComponent } from "../footer/footer.component";
import { NavbarComponent } from "../navbar/navbar.component";
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-mercado',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule, FooterComponent, NavbarComponent],
  templateUrl: './mercado.component.html',
  styleUrls: ['./mercado.component.css']
})
export class MercadoComponent implements OnInit {
  productos: any[] = [];
  productosFiltrados: any[] = [];
  searchText: string = '';
  selectedCategory: string = 'Todas las categorías'; // Categoría seleccionada
  mensajeNotificacion: string = '';
  mostrarNotificacion: boolean = false;
  // Lista de categorías
  categories: string[] = [
    'Todas las categorías', 'Frutas', 'Verduras', 'Tubérculos y Raíces', 'Granos y Cereales',
    'Legumbres', 'Hierbas y Especias', 'Frutas de Temporada', 'Hortalizas',
    'Plátano y Banano', 'Frutos Exóticos'
  ];

  constructor(private sharedService: SharedService, private authService: AuthService, private http: HttpClient, private cartService: CartService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['categoria'] || 'Todas las categorías'; // Obtener la categoría seleccionada
      this.obtenerProductos(); // Cargar productos según la categoría
    });
  }

  obtenerProductos() {
    this.http.get('https://arribaelcampo.store/api/productos').subscribe((data: any) => {
      // Filtrar productos disponibles y aprobados
      this.productos = data.filter((producto: any) => 
        producto.estado === 'disponible' && producto.estadoCalidad === 'aprobado'
      );
      this.filtrarProductos(); // Aplicar filtro después de cargar los productos
    }, error => {
      console.error('Error al obtener productos:', error);
    });
  }

  filtrarProductos() {
    const texto = this.searchText.toLowerCase();
    this.productosFiltrados = this.productos.filter(producto =>
      (this.selectedCategory === 'Todas las categorías' || producto.tipo === this.selectedCategory) &&
      producto.titulo.toLowerCase().includes(texto)
    );
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

  seleccionarCategoria(categoria: string) {
    this.selectedCategory = categoria;
    this.filtrarProductos(); // Filtrar productos cuando se selecciona una categoría
  }
}
