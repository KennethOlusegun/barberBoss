import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ConfigService } from '../core/services/config.service';

/**
 * Config Demo Component
 *
 * This component demonstrates how to use the ConfigService
 * to access configuration throughout the application.
 *
 * This is for demonstration purposes only and can be removed in production.
 *
 * To use this component:
 * 1. Import it in your routing module or standalone component
 * 2. Add it to a route
 * 3. Navigate to the route to see the demo
 */
@Component({
  selector: 'app-config-demo',
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>Configuration Demo</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Application Info</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-label>
                <h3>App Name</h3>
                <p>{{ appName }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h3>Version</h3>
                <p>{{ appVersion }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h3>Environment</h3>
                <p>{{ isProduction ? 'Production' : 'Development' }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>API Configuration</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-label>
                <h3>API URL</h3>
                <p>{{ apiUrl }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h3>Timeout</h3>
                <p>{{ apiTimeout }}ms</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Feature Flags</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-label>Debug Mode</ion-label>
              <ion-badge [color]="isDebugMode ? 'success' : 'danger'">
                {{ isDebugMode ? 'ON' : 'OFF' }}
              </ion-badge>
            </ion-item>
            <ion-item>
              <ion-label>Analytics</ion-label>
              <ion-badge [color]="isAnalytics ? 'success' : 'danger'">
                {{ isAnalytics ? 'ON' : 'OFF' }}
              </ion-badge>
            </ion-item>
            <ion-item>
              <ion-label>Push Notifications</ion-label>
              <ion-badge [color]="isPushNotifications ? 'success' : 'danger'">
                {{ isPushNotifications ? 'ON' : 'OFF' }}
              </ion-badge>
            </ion-item>
            <ion-item>
              <ion-label>Offline Mode</ion-label>
              <ion-badge [color]="isOfflineMode ? 'success' : 'danger'">
                {{ isOfflineMode ? 'ON' : 'OFF' }}
              </ion-badge>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Business Rules</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-label>
                <h3>Default Appointment Duration</h3>
                <p>{{ appointmentDuration }} minutes</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h3>Min Advance Booking</h3>
                <p>{{ minAdvanceBooking }} hours</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h3>Max Advance Booking</h3>
                <p>{{ maxAdvanceBooking }} days</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h3>Cancellation Deadline</h3>
                <p>{{ cancellationDeadline }} hours</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>UI Configuration</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-label>
                <h3>Default Theme</h3>
                <p>{{ defaultTheme }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h3>Animations</h3>
                <p>{{ areAnimations ? 'Enabled' : 'Disabled' }}</p>
              </ion-label>
            </ion-item>
            <ion-item>
              <ion-label>
                <h3>Items Per Page</h3>
                <p>{{ itemsPerPage }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <ion-card>
        <ion-card-header>
          <ion-card-title>Usage Examples</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-button expand="block" (click)="testEndpointBuilder()">
            Test Endpoint Builder
          </ion-button>
          <ion-button expand="block" (click)="testStorageKey()">
            Test Storage Key
          </ion-button>
          <ion-button expand="block" (click)="testConfigPath()">
            Test Config Path Access
          </ion-button>
          <ion-button expand="block" (click)="testLogging()">
            Test Logging
          </ion-button>
        </ion-card-content>
      </ion-card>

      <ion-card *ngIf="testResults.length > 0">
        <ion-card-header>
          <ion-card-title>Test Results</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item *ngFor="let result of testResults">
              <ion-label>
                <h3>{{ result.test }}</h3>
                <p>{{ result.result }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  styles: [
    `
      ion-card {
        margin-bottom: 16px;
      }

      ion-badge {
        margin-left: auto;
      }
    `,
  ],
})
export class ConfigDemoComponent implements OnInit {
  // Application Info
  appName: string = '';
  appVersion: string = '';
  isProduction: boolean = false;

  // API Configuration
  apiUrl: string = '';
  apiTimeout: number = 0;

  // Feature Flags
  isDebugMode: boolean = false;
  isAnalytics: boolean = false;
  isPushNotifications: boolean = false;
  isOfflineMode: boolean = false;

  // Business Rules
  appointmentDuration: number = 0;
  minAdvanceBooking: number = 0;
  maxAdvanceBooking: number = 0;
  cancellationDeadline: number = 0;

  // UI Configuration
  defaultTheme: string = '';
  areAnimations: boolean = false;
  itemsPerPage: number = 0;

  // Test Results
  testResults: Array<{ test: string; result: string }> = [];

  constructor(private configService: ConfigService) {}

  ngOnInit() {
    this.loadConfiguration();
  }

  /**
   * Load all configuration values
   */
  private loadConfiguration(): void {
    // Application Info
    this.appName = this.configService.getAppName();
    this.appVersion = this.configService.getAppVersion();
    this.isProduction = this.configService.isProduction();

    // API Configuration
    this.apiUrl = this.configService.getApiUrl();
    this.apiTimeout = this.configService.getApiTimeout();

    // Feature Flags
    this.isDebugMode = this.configService.isDebugModeEnabled();
    this.isAnalytics = this.configService.isAnalyticsEnabled();
    this.isPushNotifications = this.configService.arePushNotificationsEnabled();
    this.isOfflineMode = this.configService.isOfflineModeEnabled();

    // Business Rules
    this.appointmentDuration =
      this.configService.getDefaultAppointmentDuration();
    this.minAdvanceBooking = this.configService.getMinAdvanceBooking();
    this.maxAdvanceBooking = this.configService.getMaxAdvanceBooking();
    this.cancellationDeadline = this.configService.getCancellationDeadline();

    // UI Configuration
    this.defaultTheme = this.configService.getDefaultTheme();
    this.areAnimations = this.configService.areAnimationsEnabled();
    this.itemsPerPage = this.configService.getItemsPerPage();
  }

  /**
   * Test endpoint URL builder
   */
  testEndpointBuilder(): void {
    const usersEndpoint = this.configService.buildEndpointUrl('/users');
    const appointmentsEndpoint =
      this.configService.buildEndpointUrl('appointments');

    this.addTestResult(
      'Endpoint Builder',
      `
      /users => ${usersEndpoint}
      appointments => ${appointmentsEndpoint}
    `,
    );
  }

  /**
   * Test storage key generator
   */
  testStorageKey(): void {
    const userKey = this.configService.getStorageKey('user');
    const tokenKey = this.configService.getStorageKey('token');

    this.addTestResult(
      'Storage Key Generator',
      `
      user => ${userKey}
      token => ${tokenKey}
    `,
    );
  }

  /**
   * Test configuration path access
   */
  testConfigPath(): void {
    const baseUrl = this.configService.get('api.baseUrl');
    const logLevel = this.configService.get('logging.logLevel');
    const invalidPath = this.configService.get('invalid.path');

    this.addTestResult(
      'Config Path Access',
      `
      api.baseUrl => ${baseUrl}
      logging.logLevel => ${logLevel}
      invalid.path => ${invalidPath || 'undefined'}
    `,
    );
  }

  /**
   * Test logging
   */
  testLogging(): void {
    this.configService.log('This is a test log message', { test: true });
    this.addTestResult(
      'Logging',
      'Check console for log output (if debug mode is enabled)',
    );
  }

  /**
   * Add test result to display
   */
  private addTestResult(test: string, result: string): void {
    this.testResults.unshift({ test, result });
    if (this.testResults.length > 5) {
      this.testResults.pop();
    }
  }
}
