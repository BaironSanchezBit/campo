import { Component } from '@angular/core';
import { NavbarComponent } from "../navbar/navbar.component";
import { FooterComponent } from "../footer/footer.component";

@Component({
  selector: 'app-sistemas-riego-inteligente',
  standalone: true,
  imports: [NavbarComponent, FooterComponent],
  templateUrl: './sistemas-riego-inteligente.component.html',
  styleUrl: './sistemas-riego-inteligente.component.css'
})
export class SistemasRiegoInteligenteComponent {

}
