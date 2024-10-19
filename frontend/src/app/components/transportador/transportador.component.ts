import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PedidoService } from '../../services/pedido.service';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-transportador',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, HttpClientModule, RouterModule, FooterComponent],
  templateUrl: './transportador.component.html',
  styleUrl: './transportador.component.css'
})
export class TransportadorComponent implements OnInit {

  constructor(private pedidoService: PedidoService) { }

  ngOnInit() {
  }
}