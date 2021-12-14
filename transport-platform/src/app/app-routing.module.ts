import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { ProfileComponent } from './profile/profile.component';
import { StartComponent } from './start/start.component';
import { TranporterComponent } from './tranporter/tranporter.component';
import { ClientComponent } from './client/client.component';
import { AdminComponent } from './admin/admin.component';

const routes: Routes = [ 
    {path: 'start', component: StartComponent},
    {path: 'profile', component: ProfileComponent},
    {path: 'transporter', component: TranporterComponent},
    {path: 'client', component: ClientComponent},
    {path: 'admin', component: AdminComponent}

]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
