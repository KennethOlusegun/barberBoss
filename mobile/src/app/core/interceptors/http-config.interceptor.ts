import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  constructor(private toastController: ToastController) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Adiciona headers necessários
    const modifiedRequest = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': '69420', // CRÍTICO: Bypass warning Ngrok
      },
    });

    // Log em modo debug
    if (environment.features.enableDebugMode) {
      console.log('🌐 HTTP Request:', {
        url: modifiedRequest.url,
        method: modifiedRequest.method,
      });
    }

    return next.handle(modifiedRequest).pipe(
      timeout(environment.api.timeout),
      // Retry: 2 tentativas com delay de 1s
      retry({
        count: 2,
        delay: (error, retryCount) => {
          // Não retry em erros 4xx (erro do cliente)
          if (error.status >= 400 && error.status < 500) {
            return throwError(() => error);
          }
          console.log(`🔄 Retry ${retryCount}/2`);
          return timer(1000);
        },
      }),
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error);
      })
    );
  }

  private async handleError(error: HttpErrorResponse): Promise<Observable<never>> {
    let errorMessage = 'Erro desconhecido';

    if (error.error instanceof ErrorEvent) {
      // Erro de rede
      errorMessage = `Sem conexão com o servidor`;
      console.error('🔴 Erro de Rede:', error.error.message);
    } else {
      // Erro do servidor
      errorMessage = this.getServerErrorMessage(error);
      console.error('🔴 Erro HTTP:', {
        status: error.status,
        message: error.message,
      });
    }

    // Exibir toast apenas para erros críticos
    if (error.status !== 401 && error.status !== 400) {
      await this.showErrorToast(errorMessage);
    }

    return throwError(() => error);
  }

  private getServerErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'Não foi possível conectar ao servidor. Verifique sua internet.';
      case 401:
        return 'Sessão expirada. Faça login novamente.';
      case 404:
        return 'Recurso não encontrado';
      case 500:
        return 'Erro interno do servidor';
      case 502:
      case 503:
        return 'Servidor temporariamente indisponível';
      case 504:
        return 'Tempo de resposta esgotado';
      default:
        return error.error?.message || `Erro ${error.status}`;
    }
  }

  private async showErrorToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      position: 'top',
      color: 'danger',
      buttons: [{ text: 'OK', role: 'cancel' }],
    });
    await toast.present();
  }
}
