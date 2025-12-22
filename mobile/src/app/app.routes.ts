import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Rota raiz redireciona para login (Padrão)
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

  // Rotas Públicas (Auth)
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.page').then(m => m.LoginPage),
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.page').then(m => m.RegisterPage),
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./pages/auth/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage),
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./pages/auth/reset-password/reset-password.page').then(m => m.ResetPasswordPage),
      },
      {
        path: 'logout',
        loadComponent: () => import('./pages/auth/logout.page').then(m => m.LogoutPage),
      },
    ],
  },

  // Atalho para reset (opcional, mantive do seu código)
  {
    path: 'reset-password',
    redirectTo: 'auth/reset-password',
    pathMatch: 'full',
  },

  // === ÁREA PROTEGIDA (DASHBOARD É A HOME) ===
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [AuthGuard],
  },

  // Agendamentos
  {
    path: 'barber/appointments',
    loadComponent: () => import('./pages/barber/appointments/appointments-list.page').then(m => m.AppointmentsListPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'barber/appointments/create',
    loadComponent: () => import('./pages/barber/appointments/appointments-form.page').then(m => m.AppointmentsFormPage),
    canActivate: [AuthGuard],
  },

  // Clientes
  {
    path: 'barber/clients',
    loadComponent: () => import('./pages/barber/clients/clients-list.page').then(m => m.ClientsListPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'barber/clients/form',
    loadComponent: () => import('./pages/barber/clients/client-form.page').then(m => m.ClientFormPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'barber/clients/form/:id',
    loadComponent: () => import('./pages/barber/clients/client-form.page').then(m => m.ClientFormPage),
    canActivate: [AuthGuard],
  },

  // Outros Serviços e Financeiro
  {
    path: 'barber/services',
    loadComponent: () => import('./pages/barber/services/services-list.page').then(m => m.ServicesListPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'barber/finance',
    loadComponent: () => import('./pages/barber/finance/finance-summary.page').then(m => m.FinanceSummaryPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'barber/finance/list',
    loadComponent: () => import('./pages/barber/finance/finance-list.page').then(m => m.FinanceListPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'barber/profile',
    loadComponent: () => import('./pages/barber/profile/profile.page').then(m => m.ProfilePage),
    canActivate: [AuthGuard],
  },

  // Admin
  {
    path: 'admin',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin/admin.page').then(m => m.AdminPage),
      },
      {
        path: 'barbers',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/admin/barbers/barbers.page').then(m => m.AdminBarbersPage),
          },
          {
            path: 'new',
            loadComponent: () => import('./pages/admin/barbers/barber-form.page').then(m => m.AdminBarberFormPage),
          },
          {
            path: ':id',
            loadComponent: () => import('./pages/admin/barbers/barber-form.page').then(m => m.AdminBarberFormPage),
          },
        ],
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/admin/settings/settings.page').then(m => m.AdminSettingsPage),
      },
    ],
  },

  // OBS: Removi a rota 'tabs' para evitar confusão se você não for usá-la.
];
