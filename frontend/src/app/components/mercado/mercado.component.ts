import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { FooterComponent } from "../footer/footer.component";
import { NavbarComponent } from "../navbar/navbar.component";
import Swal from 'sweetalert2';

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
    'Todas las categorías', 'Productos Frescos', 'Lácteos y Huevos', 'Carnes y Aves', 'Granos y Cereales',
    'Legumbres', 'Hierbas y Especias', 'Bebidas', 'Productos de Panadería',
    'Productos Procesados y Empaquetados', 'Productos Artesanales', 'Alternativas Lácteas',
    'Productos Naturales y Orgánicos', 'Productos de Temporada'
  ];

  constructor(private http: HttpClient, private cartService: CartService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['categoria'] || 'Todas las categorías'; // Obtener la categoría seleccionada
      this.obtenerProductos(); // Cargar productos según la categoría
    });
  }

  obtenerProductos() {
    this.http.get('http://localhost:4000/api/productos').subscribe((data: any) => {
      // Solo obtener productos disponibles
      this.productos = data.filter((producto: any) => producto.estado === 'disponible');
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
    return `http://localhost:4000/uploads/${foto}`;
  }

  transform(value: number): string {
    return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  addToCart(producto: any) {
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
