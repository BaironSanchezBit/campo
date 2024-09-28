import { Routes } from '@angular/router';
import { InicioComponent } from './components/inicio/inicio.component';
import { PerfilComponent } from './components/perfil/perfil.component';

export const routes: Routes = [
    { path: '', component: InicioComponent},
    { path: 'perfil', component: PerfilComponent},
    { path: '', redirectTo: '', pathMatch: 'full' }
];