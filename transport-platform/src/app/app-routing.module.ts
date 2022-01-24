import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { StartComponent } from './start/start.component';
import { TransporterComponent } from './transporter/transporter.component';
import { ClientComponent } from './client/client.component';
import { AdminComponent } from './admin/admin.component';
import { map } from 'esri/widgets/TableList/TableListViewModel';

const routes: Routes = [
    {path: 'start', component: StartComponent},
    {path: 'profile', component: ProfileComponent},
    {path: 'transporter', component: TransporterComponent},
    {path: 'client', component: ClientComponent},
    {path: 'admin', component: AdminComponent},
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
