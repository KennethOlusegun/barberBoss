import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpConfigInterceptor } from './core/interceptors/http-config.interceptor';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    IonicModule.forRoot(),
    HttpClientModule,
    RouterModule,
    MatIconModule,
    AppComponent
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true }
  ],
  // Standalone bootstrap será feito em main.ts
})
export class AppModule {}
