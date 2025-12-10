# Quick Start Guide - Environment Configuration

## 📋 Overview

This guide will help you quickly set up and use the environment configuration system in the Barber Boss mobile application.

## 🚀 Getting Started

### 1. Configuration Files Created

The following files have been created for environment configuration:

```
mobile/
├── .env.example                                    # Environment variables template
├── src/
│   ├── environments/
│   │   ├── environment.interface.ts                # TypeScript interface
│   │   ├── environment.ts                          # Development config
│   │   └── environment.prod.ts                     # Production config
│   └── app/
│       ├── core/services/
│       │   ├── config.service.ts                   # Configuration service
│       │   ├── config.service.spec.ts              # Unit tests
│       │   └── index.ts                            # Barrel export
│       └── examples/
│           ├── config-demo.component.ts            # Demo component
│           └── README.md                           # Examples documentation
└── docs/mobile/
    └── ENVIRONMENT_CONFIGURATION.md                # Full documentation
```

## 🔧 Basic Setup

### Step 1: Review Environment Files

The environment files are pre-configured with sensible defaults:

**Development (`environment.ts`):**
- API URL: `http://localhost:3000`
- Debug mode: `ON`
- Analytics: `OFF`
- Console logging: `ON`

**Production (`environment.prod.ts`):**
- API URL: `https://api.barberboss.com` (⚠️ UPDATE THIS!)
- Debug mode: `OFF`
- Analytics: `ON`
- Console logging: `OFF`

### Step 2: Update Production URL

Before deploying to production, update the API URL in `environment.prod.ts`:

```typescript
api: {
  baseUrl: 'https://your-actual-api-url.com', // ← Change this!
  apiPrefix: '/api/v1',
  timeout: 30000,
}
```

## 💡 Usage Examples

### Import the Service

```typescript
import { ConfigService } from './core/services';

constructor(private config: ConfigService) {}
```

### Common Use Cases

#### 1. Making API Calls

```typescript
// Get API URL
const apiUrl = this.config.getApiUrl();

// Build endpoint
const endpoint = this.config.buildEndpointUrl('/appointments');

// Make HTTP request
this.http.get(endpoint).subscribe(...);
```

#### 2. Check Feature Flags

```typescript
// Check if feature is enabled
if (this.config.isDebugModeEnabled()) {
  console.log('Debug info:', data);
}

if (this.config.isAnalyticsEnabled()) {
  this.analytics.track('event');
}
```

#### 3. Use Business Rules

```typescript
// Get appointment duration
const duration = this.config.getDefaultAppointmentDuration();

// Get booking limits
const minHours = this.config.getMinAdvanceBooking();
const maxDays = this.config.getMaxAdvanceBooking();
```

#### 4. Storage Keys

```typescript
// Get prefixed storage key
const key = this.config.getStorageKey('user');

// Store data
localStorage.setItem(key, JSON.stringify(user));
```

## 🧪 Testing

Run the included tests:

```bash
npm test
```

View the demo component (development only):
- Add `ConfigDemoComponent` to a route
- Navigate to see all configuration values and test functions

## ⚙️ Configuration Sections

| Section | Purpose | Key Properties |
|---------|---------|----------------|
| `api` | Backend API settings | baseUrl, apiPrefix, timeout |
| `auth` | Authentication | tokenKey, refreshTokenKey |
| `app` | Application info | name, version, language |
| `features` | Feature flags | enableDebugMode, enableAnalytics |
| `logging` | Logging config | logLevel, enableConsoleLogging |
| `storage` | Storage settings | prefix, type |
| `business` | Business rules | appointmentDuration, bookingLimits |
| `ui` | UI/UX settings | theme, animations, itemsPerPage |

## 🔐 Security

✅ **Do:**
- Keep `.env` files out of git
- Use environment variables in CI/CD
- Rotate keys regularly
- Use HTTPS in production

❌ **Don't:**
- Commit sensitive data
- Hardcode API keys
- Use HTTP in production
- Share production credentials

## 📝 Next Steps

1. **Review the configuration:**
   - Check `environment.ts` for development settings
   - Update `environment.prod.ts` for production

2. **Integrate into your services:**
   - Replace hardcoded URLs with `ConfigService`
   - Use feature flags for conditional features
   - Apply business rules from configuration

3. **Test thoroughly:**
   - Run unit tests
   - Test in development mode
   - Test production build

4. **Read full documentation:**
   - See `docs/mobile/ENVIRONMENT_CONFIGURATION.md`
   - Review examples in `app/examples/`

## 🆘 Need Help?

- **Full Documentation:** `docs/mobile/ENVIRONMENT_CONFIGURATION.md`
- **API Reference:** Check `config.service.ts` JSDoc comments
- **Examples:** See `app/examples/config-demo.component.ts`
- **Tests:** Review `config.service.spec.ts`

## ✅ Checklist

Before using in production:

- [ ] Updated production API URL in `environment.prod.ts`
- [ ] Disabled debug mode in production
- [ ] Enabled analytics in production (if needed)
- [ ] Configured proper logging levels
- [ ] Set correct business rules
- [ ] Tested production build
- [ ] Verified all environment variables
- [ ] Added `.env` to `.gitignore`
- [ ] Removed or protected demo components

## 🎯 Quick Reference

```typescript
// Common ConfigService methods
this.config.getApiUrl()                     // Full API URL
this.config.buildEndpointUrl('/path')       // Build endpoint
this.config.isDebugModeEnabled()           // Check debug mode
this.config.isFeatureEnabled('feature')    // Check feature flag
this.config.getStorageKey('key')           // Get prefixed key
this.config.get('api.baseUrl')             // Get by path
this.config.getDefaultAppointmentDuration() // Business rules
```

---

**Ready to go!** 🚀 Start using `ConfigService` in your components and services.
