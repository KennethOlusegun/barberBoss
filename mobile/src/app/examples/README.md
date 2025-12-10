# Configuration Examples

This directory contains example components demonstrating how to use various services and features in the Barber Boss mobile application.

## ⚠️ Important Note

The example components are **standalone components** and ready to use. They include all necessary imports for Ionic and Angular.

## Available Examples

### ConfigDemoComponent (✅ Ready to Use)

**Status:** Standalone component with all dependencies included

Demonstrates the usage of `ConfigService` for accessing application configuration.

**Location:** `config-demo.component.ts`

**Features:**
- Display all configuration values
- Test endpoint URL building
- Test storage key generation
- Test configuration path access
- Test logging functionality

**Usage:**

Since this is a standalone component, you can use it directly in your routes:

```typescript
// In your routing configuration
{
  path: 'config-demo',
  loadComponent: () => import('./examples/config-demo.component').then(m => m.ConfigDemoComponent)
}
```

Or import it directly:

```typescript
import { ConfigDemoComponent } from './examples/config-demo.component';

// In your routes
{
  path: 'config-demo',
  component: ConfigDemoComponent
}
```

Then navigate to `/config-demo` to see the demo.

**Note:** This component is for development and testing purposes only. Remove it in production builds or protect it with appropriate guards.

## Adding New Examples

When creating new example components:

1. Create a new file in this directory
2. Use clear naming: `[feature]-demo.component.ts`
3. Add comprehensive comments explaining the usage
4. Include both UI and code examples
5. Add entry to this README

## Best Practices

- Keep examples simple and focused on one feature
- Include error handling demonstrations
- Show both success and failure cases
- Document any dependencies
- Make examples easily removable for production

## Removing Examples from Production

To exclude examples from production builds:

1. Create a separate module for examples
2. Only import the examples module in development
3. Use environment flags to conditionally load examples
4. Or simply delete this directory before production deployment

Example:

```typescript
// app.module.ts
import { environment } from '../environments/environment';

const imports = [
  // ... other imports
];

if (!environment.production) {
  imports.push(ExamplesModule);
}

@NgModule({
  imports,
  // ... other config
})
export class AppModule {}
```
