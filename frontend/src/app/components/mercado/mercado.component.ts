import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-mercado',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule, NavbarComponent],
  templateUrl: './mercado.component.html',
  styleUrl: './mercado.component.css'
})
export class MercadoComponent implements OnInit {
  productos: any[] = [];

  constructor(private http: HttpClient, private cartService: CartService) { }

  ngOnInit() {
    this.obtenerProductos();
  }

  obtenerProductos() {
    this.http.get('http://localhost:4000/api/productos').subscribe((data: any) => {
      this.productos = data;
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
