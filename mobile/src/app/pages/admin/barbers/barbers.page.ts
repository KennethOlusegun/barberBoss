import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BarberService, Barber } from 'src/app/core/services/barber.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-barbers',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './barbers.page.html',
  styleUrls: ['./barbers.page.scss']
})
export class AdminBarbersPage implements OnInit {
  barbers: Barber[] = [];
  loading = false;

  constructor(private barberService: BarberService, private router: Router) {}

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
      }
    });
  }

  editBarber(barber: Barber) {
    this.router.navigate(['admin', 'barbers', barber.id]);
  }

  deleteBarber(barber: Barber) {
    if (confirm(`Remover barbeiro ${barber.name}?`)) {
      this.barberService.deleteBarber(barber.id!).subscribe(() => {
        this.loadBarbers();
      });
    }
  }
}
