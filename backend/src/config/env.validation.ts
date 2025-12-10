import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsNotEmpty()
  NODE_ENV: Environment;

  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsNotEmpty()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_USER: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_DB: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN?: string = '7d';

  @IsString()
  @IsOptional()
  ALLOWED_ORIGINS?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  THROTTLE_TTL?: number = 60000;

  @IsNumber()
  @Min(1)
  @IsOptional()
  THROTTLE_LIMIT?: number = 10;

  @IsString()
  @IsOptional()
  CORS_CREDENTIALS?: string = 'true';

  @IsNumber()
  @Min(0)
  @Max(23)
  @IsOptional()
  DEFAULT_BUSINESS_HOUR_START?: number = 8;

  @IsNumber()
  @Min(0)
  @Max(23)
  @IsOptional()
  DEFAULT_BUSINESS_HOUR_END?: number = 18;

  @IsNumber()
  @Min(15)
  @Max(120)
  @IsOptional()
  DEFAULT_APPOINTMENT_DURATION?: number = 30;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map((error) => {
        const constraints = error.constraints
          ? Object.values(error.constraints).join(', ')
          : 'Unknown error';
        return `${error.property}: ${constraints}`;
      })
      .join('\n');

    throw new Error(
      `Environment validation failed:\n${errorMessages}\n\nPlease check your .env file and ensure all required variables are set correctly.`,
    );
  }

  return validatedConfig;
}
