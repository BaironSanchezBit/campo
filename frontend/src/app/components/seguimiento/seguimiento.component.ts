import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NavbarComponent } from "../navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  templateUrl: './seguimiento.component.html',
  styleUrls: ['./seguimiento.component.css'],
  imports: [NavbarComponent, CommonModule, FormsModule, HttpClientModule, RouterModule, FooterComponent]
})
export class SeguimientoComponent implements OnInit {
  pedidoId: string | null = null;
  pedido: any = null;

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.pedidoId = params.get('id');  // Asegúrate de que el parámetro 'id' sea correcto
      if (this.pedidoId) {
        this.obtenerDetallesPedido(this.pedidoId);
      }
    });
  }

  obtenerDetallesPedido(id: string) {
    this.http.get(`http://localhost:4000/api/pedido/getPedidoId/${id}`)  // Cambia la URL para que use pedidoId
      .subscribe((data: any) => {
        this.pedido = data;
        console.log(data)
      }, error => {
        console.error('Error al obtener el pedido:', error);
      });
  }

  allProductsDelivered(): boolean {
    return this.pedido?.productos.every((producto: any) => producto.estado === 'Entregado a empresa transportadora');
  }
}