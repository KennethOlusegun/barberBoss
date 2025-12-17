import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TestPage } from './test.page';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: TestPage }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TestPage
  ]
})
export class TestPageModule {}
