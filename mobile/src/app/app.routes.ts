import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth/login/login.page').then((m) => m.LoginPage),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/auth/register/register.page').then(
            (m) => m.RegisterPage,
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./pages/auth/forgot-password/forgot-password.page').then(
            (m) => m.ForgotPasswordPage,
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./pages/auth/reset-password/reset-password.page').then(
            (m) => m.ResetPasswordPage,
          ),
      },
      {
        path: 'logout',
        loadComponent: () =>
          import('./pages/auth/logout.page').then((m) => m.LogoutPage),
      },
    ],
  },
  {
    path: 'reset-password',
    redirectTo: 'auth/reset-password',
    pathMatch: 'full',
  },

  {
    path: 'admin',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/admin/admin.page').then((m) => m.AdminPage),
        canActivate: [AuthGuard],
      },
      {
        path: 'barbers',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/admin/barbers/barbers.page').then(
                (m) => m.AdminBarbersPage,
              ),
            canActivate: [AuthGuard],
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./pages/admin/barbers/barber-form.page').then(
                (m) => m.AdminBarberFormPage,
              ),
            canActivate: [AuthGuard],
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/admin/barbers/barber-form.page').then(
                (m) => m.AdminBarberFormPage,
              ),
            canActivate: [AuthGuard],
          },
        ],
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/admin/settings/settings.page').then(
            (m) => m.AdminSettingsPage,
          ),
        canActivate: [AuthGuard],
      },
    ],
  },
  {
    path: 'create-appointment',
    loadChildren: () =>
      import('./pages/create-appointment/create-appointment.module').then(
        (m) => m.CreateAppointmentPageModule,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [AuthGuard],
  },
  // Rotas para páginas principais do barbeiro
  {
    path: 'barber/clients',
    loadComponent: () =>
      import('./pages/barber/clients/clients-list.page').then(
        (m) => m.ClientsListPage,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'barber/clients/form',
    loadComponent: () =>
      import('./pages/barber/clients/client-form.page').then(
        (m) => m.ClientFormPage,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'barber/clients/form/:id',
    loadComponent: () =>
      import('./pages/barber/clients/client-form.page').then(
        (m) => m.ClientFormPage,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'barber/services',
    loadComponent: () =>
      import('./pages/barber/services/services-list.page').then(
        (m) => m.ServicesListPage,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'barber/finance',
    loadComponent: () =>
      import('./pages/barber/finance/finance-summary.page').then(
        (m) => m.FinanceSummaryPage,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'barber/profile',
    loadComponent: () =>
      import('./pages/barber/profile/profile.page').then((m) => m.ProfilePage),
    canActivate: [AuthGuard],
  },
];
