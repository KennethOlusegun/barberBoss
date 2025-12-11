import { Component } from '@angular/core';

import { DashboardPage } from '../pages/dashboard/dashboard.page';

@Component({
  selector: 'app-tab-dashboard',
  templateUrl: 'tab-dashboard.page.html',
  styleUrls: ['tab-dashboard.page.scss'],
  standalone: true,
  imports: [DashboardPage],
})
export class TabDashboardPage {}
