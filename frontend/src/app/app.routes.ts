import { Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { MercadoComponent } from './components/mercado/mercado.component';
import { PublicarComponent } from './components/publicar/publicar.component';

export const routes: Routes = [
    { path: '', component: InicioComponent},
    { path: 'perfil', component: PerfilComponent},
    { path: 'mercado', component: MercadoComponent},
    { path: 'publicar', component: PublicarComponent},
    { path: '', redirectTo: '', pathMatch: 'full' }
];