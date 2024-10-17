import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-productividad-campo',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './productividad-campo.component.html',
  styleUrl: './productividad-campo.component.css'
})
export class ProductividadCampoComponent {

}
