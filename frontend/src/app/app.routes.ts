import { Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { MercadoComponent } from './components/mercado/mercado.component';
import { PublicarComponent } from './components/publicar/publicar.component';
import { MisProductosComponent } from './components/mis-productos/mis-productos.component';
import { TendenciasAgriculturaSostenibleComponent } from './components/tendencias-agricultura-sostenible/tendencias-agricultura-sostenible.component';
import { SistemasRiegoInteligenteComponent } from './components/sistemas-riego-inteligente/sistemas-riego-inteligente.component';
import { ProductividadCampoComponent } from './components/productividad-campo/productividad-campo.component';
import { PoliticaPrivacidadComponent } from './components/politica-privacidad/politica-privacidad.component';
import { TerminosCondicionesComponent } from './components/terminos-condiciones/terminos-condiciones.component';
import { PaymentComponent } from './components/payment/payment.component';
import { CancelComponent } from './components/cancel/cancel.component';
import { SuccessComponent } from './components/success/success.component';
import { MisPedidosComponent } from './components/mis-pedidos/mis-pedidos.component';
import { SeguimientoComponent } from './components/seguimiento/seguimiento.component';

export const routes: Routes = [
    { path: '', component: InicioComponent },
    { path: 'perfil', component: PerfilComponent },
    { path: 'mercado', component: MercadoComponent },
    { path: 'success', component: SuccessComponent },
    { path: 'cancel', component: CancelComponent },
    { path: 'mis-pedidos', component: MisPedidosComponent },
    { path: 'seguimiento/:id', component: SeguimientoComponent },
    { path: 'publicar', component: PublicarComponent },
    { path: 'pasarela-pago', component: PaymentComponent },
    { path: 'mis-publicaciones', component: MisProductosComponent },
    { path: 'productividad-campo', component: ProductividadCampoComponent },
    { path: 'sistemas-riego-inteligente', component: SistemasRiegoInteligenteComponent },
    { path: 'tendencias-agricultura-sostenible', component: TendenciasAgriculturaSostenibleComponent },
    { path: 'politica-privacidad', component: PoliticaPrivacidadComponent },
    { path: 'terminos-condiciones', component: TerminosCondicionesComponent },
    { path: '', redirectTo: '', pathMatch: 'full' }
];