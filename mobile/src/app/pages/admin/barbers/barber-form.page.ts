import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BarberService, Barber } from 'src/app/core/services/barber.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-barber-form',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  templateUrl: './barber-form.page.html',
  styleUrls: ['./barber-form.page.scss']
})
export class AdminBarberFormPage implements OnInit {
  form: FormGroup;
  isEdit = false;
  barberId?: string;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private barberService: BarberService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.barberId = this.route.snapshot.paramMap.get('id') ?? undefined;
    if (this.barberId) {
      this.isEdit = true;
      this.loading = true;
      this.barberService.getBarber(this.barberId).subscribe({
        next: (barber) => {
          this.form.patchValue(barber);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    const data: Barber = this.form.value;
    if (this.isEdit && this.barberId) {
      this.barberService.updateBarber(this.barberId, data).subscribe({
        next: () => this.router.navigate(['../'], { relativeTo: this.route }),
        complete: () => (this.loading = false)
      });
    } else {
      this.barberService.createBarber(data).subscribe({
        next: () => this.router.navigate(['../'], { relativeTo: this.route }),
        complete: () => (this.loading = false)
      });
    }
  }
}
