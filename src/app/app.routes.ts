import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { UserSelectedGuard } from './shared/guards/user-selected/user-selected.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [UserSelectedGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./shared/pages/home/home.component').then(
            (m) => m.HomeComponent
          ),
      },
      {
        path: 'bingo',
        loadComponent: () =>
          import('./shared/pages/bingo/bingo.component').then(
            (m) => m.BingoComponent
          ),
      },
    ],
  },
  {
    path: 'select-user',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./shared/pages/select-user/select-user.component').then(
            (m) => m.SelectUserComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
