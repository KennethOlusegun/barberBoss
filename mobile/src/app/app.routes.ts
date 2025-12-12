import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage)
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.page').then(m => m.RegisterPage)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/auth/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./pages/auth/reset-password/reset-password.page').then(m => m.ResetPasswordPage)
      }
      ,
      {
        path: 'logout',
        loadComponent: () => import('./pages/auth/logout.page').then(m => m.LogoutPage)
      }
    ]
  },
  {
    path: 'reset-password',
    redirectTo: 'auth/reset-password',
    pathMatch: 'full'
  },

  {
    path: 'admin',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin/admin.page').then(m => m.AdminPage),
        canActivate: [AuthGuard]
      },
      {
        path: 'barbers',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/barbers/barbers.page').then(m => m.AdminBarbersPage),
            canActivate: [AuthGuard]
          },
          {
            path: 'new',
            loadComponent: () => import('./pages/admin/barbers/barber-form.page').then(m => m.AdminBarberFormPage),
            canActivate: [AuthGuard]
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/admin/barbers/barber-form.page').then(m => m.AdminBarberFormPage),
            canActivate: [AuthGuard]
          }
        ]
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/admin/settings/settings.page').then(m => m.AdminSettingsPage),
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: 'create-appointment',
    loadChildren: () => import('./pages/create-appointment/create-appointment.module').then(m => m.CreateAppointmentPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [AuthGuard]
  },
];
