import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Platform } from '@ionic/angular';
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/http';
import { environment } from '../../environments/environment';
import { Observable, from } from 'rxjs';

/**
 * Serviço HTTP universal para Angular/Ionic usando CapacitorHttp no mobile e HttpClient no web.
 * Adiciona automaticamente o header 'ngrok-skip-browser-warning' e concatena a baseUrl do environment.
 */
@Injectable({ providedIn: 'root' })
export class HttpService {
  private baseUrl = environment.api.baseUrl;

  constructor(private http: HttpClient, private platform: Platform) {}

  private getHeaders(customHeaders?: any): any {
    return {
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'application/json',
      ...(customHeaders || {})
    };
  }

  get<T>(endpoint: string, options: any = {}): Observable<T> {
    const url = this.baseUrl + endpoint;
    if (this.platform.is('capacitor')) {
      const opts: HttpOptions = {
        url,
        headers: this.getHeaders(options.headers),
        params: options.params || {},
      };
      return from(CapacitorHttp.get(opts).then((res: HttpResponse) => res.data));
    } else {
      return this.http.get<T>(url, {
        headers: new HttpHeaders(this.getHeaders(options.headers)),
        params: options.params || {}
      });
    }
  }

  post<T>(endpoint: string, body: any, options: any = {}): Observable<T> {
    const url = this.baseUrl + endpoint;
    if (this.platform.is('capacitor')) {
      const opts: HttpOptions = {
        url,
        headers: this.getHeaders(options.headers),
        data: body
      };
      return from(CapacitorHttp.post(opts).then((res: HttpResponse) => res.data));
    } else {
      return this.http.post<T>(url, body, {
        headers: new HttpHeaders(this.getHeaders(options.headers))
      });
    }
  }

  put<T>(endpoint: string, body: any, options: any = {}): Observable<T> {
    const url = this.baseUrl + endpoint;
    if (this.platform.is('capacitor')) {
      const opts: HttpOptions = {
        url,
        headers: this.getHeaders(options.headers),
        data: body
      };
      return from(CapacitorHttp.put(opts).then((res: HttpResponse) => res.data));
    } else {
      return this.http.put<T>(url, body, {
        headers: new HttpHeaders(this.getHeaders(options.headers))
      });
    }
  }

  delete<T>(endpoint: string, options: any = {}): Observable<T> {
    const url = this.baseUrl + endpoint;
    if (this.platform.is('capacitor')) {
      const opts: HttpOptions = {
        url,
        headers: this.getHeaders(options.headers),
        params: options.params || {},
      };
      return from(CapacitorHttp.delete(opts).then((res: HttpResponse) => res.data));
    } else {
      return this.http.delete<T>(url, {
        headers: new HttpHeaders(this.getHeaders(options.headers)),
        params: options.params || {}
      });
    }
  }
}
