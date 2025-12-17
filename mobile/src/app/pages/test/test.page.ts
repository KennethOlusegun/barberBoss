import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { HttpService } from '../../services/http.service';

import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-test',
  templateUrl: './test.page.html',
  styleUrls: ['./test.page.scss'],
  standalone: true,
  imports: [IonicModule]
})
export class TestPage {
  constructor(private http: HttpService, private alertCtrl: AlertController) {}

  async testConnection() {
    try {
      const result = await this.http.get<any>('/api/health');
      const alert = await this.alertCtrl.create({
        header: 'Sucesso',
        message: 'Conexão bem-sucedida! ' + JSON.stringify(result),
        buttons: ['OK']
      });
      await alert.present();
      console.log(result);
    } catch (error: any) {
      const alert = await this.alertCtrl.create({
        header: 'Erro',
        message: 'Falha na conexão: ' + (error?.message || error),
        buttons: ['OK']
      });
      await alert.present();
      console.error(error);
    }
  }
}
