import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CreateAppointmentPage } from './create-appointment.page';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    CreateAppointmentPage,
    RouterModule.forChild([{ path: '', component: CreateAppointmentPage }]),
  ],
})
export class CreateAppointmentPageModule {}
