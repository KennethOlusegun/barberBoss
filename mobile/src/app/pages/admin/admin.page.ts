import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BarberService, Barber } from 'src/app/core/services/barber.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  barbers: Barber[] = [];
  loading = false;

  constructor(
    private barberService: BarberService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadBarbers();
  }

  loadBarbers() {
    this.loading = true;
    this.barberService.getBarbers().subscribe({
      next: (barbers) => {
        this.barbers = barbers;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  goToBarbers() {
    this.router.navigate(['/admin/barbers']);
  }

  goToSettings() {
    this.router.navigate(['/admin/settings']);
  }
}
