import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-tendencias-agricultura-sostenible',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './tendencias-agricultura-sostenible.component.html',
  styleUrl: './tendencias-agricultura-sostenible.component.css'
})
export class TendenciasAgriculturaSostenibleComponent {

}
