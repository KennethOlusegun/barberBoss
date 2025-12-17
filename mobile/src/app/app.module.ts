import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgrokHttpInterceptor } from './interceptors/http.interceptor';

@NgModule({
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    HttpClientModule,
    AppComponent
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: NgrokHttpInterceptor, multi: true }
  ],
  // Standalone bootstrap será feito em main.ts
})
export class AppModule {}
