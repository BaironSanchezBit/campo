import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-contrato-comprador',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './contrato-comprador.component.html',
  styleUrl: './contrato-comprador.component.css'
})
export class ContratoCompradorComponent {

}
