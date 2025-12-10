/**
 * Application Constants
 *
 * This file contains constant values used throughout the application.
 * These are different from environment configuration - they are business
 * logic constants that don't change between environments.
 *
 * For environment-specific values, use ConfigService instead.
 */

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Local Storage Keys
 * Note: These will be automatically prefixed by ConfigService.getStorageKey()
 */
export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  LANGUAGE: 'language',
  THEME: 'theme',
  LAST_SYNC: 'last_sync',
  OFFLINE_QUEUE: 'offline_queue',
} as const;

/**
 * API Endpoints
 * Use with ConfigService.buildEndpointUrl()
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Users
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
  },

  // Appointments
  APPOINTMENTS: {
    BASE: '/appointments',
    AVAILABLE_SLOTS: '/appointments/available-slots',
    BY_ID: (id: string | number) => `/appointments/${id}`,
    CANCEL: (id: string | number) => `/appointments/${id}/cancel`,
    CONFIRM: (id: string | number) => `/appointments/${id}/confirm`,
  },

  // Services
  SERVICES: {
    BASE: '/services',
    BY_ID: (id: string | number) => `/services/${id}`,
  },

  // Settings
  SETTINGS: {
    BASE: '/settings',
    BUSINESS_HOURS: '/settings/business-hours',
    TIME_BLOCKS: '/settings/time-blocks',
  },
} as const;

/**
 * Date and Time Formats
 */
export const DATE_FORMATS = {
  // Display formats
  DATE_SHORT: 'DD/MM/YYYY',
  DATE_LONG: 'DD [de] MMMM [de] YYYY',
  TIME: 'HH:mm',
  TIME_SECONDS: 'HH:mm:ss',
  DATETIME: 'DD/MM/YYYY HH:mm',
  DATETIME_LONG: 'DD [de] MMMM [de] YYYY [às] HH:mm',

  // API formats
  API_DATE: 'YYYY-MM-DD',
  API_TIME: 'HH:mm:ss',
  API_DATETIME: 'YYYY-MM-DD HH:mm:ss',
  API_ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
} as const;

/**
 * Appointment Status
 */
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
} as const;

/**
 * Appointment Status Labels (Portuguese)
 */
export const APPOINTMENT_STATUS_LABELS = {
  [APPOINTMENT_STATUS.PENDING]: 'Pendente',
  [APPOINTMENT_STATUS.CONFIRMED]: 'Confirmado',
  [APPOINTMENT_STATUS.CANCELLED]: 'Cancelado',
  [APPOINTMENT_STATUS.COMPLETED]: 'Concluído',
  [APPOINTMENT_STATUS.NO_SHOW]: 'Não Compareceu',
} as const;

/**
 * Appointment Status Colors (Ionic)
 */
export const APPOINTMENT_STATUS_COLORS = {
  [APPOINTMENT_STATUS.PENDING]: 'warning',
  [APPOINTMENT_STATUS.CONFIRMED]: 'success',
  [APPOINTMENT_STATUS.CANCELLED]: 'danger',
  [APPOINTMENT_STATUS.COMPLETED]: 'medium',
  [APPOINTMENT_STATUS.NO_SHOW]: 'dark',
} as const;

/**
 * User Roles
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  BARBER: 'barber',
  CLIENT: 'client',
} as const;

/**
 * User Role Labels (Portuguese)
 */
export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrador',
  [USER_ROLES.BARBER]: 'Barbeiro',
  [USER_ROLES.CLIENT]: 'Cliente',
} as const;

/**
 * Time Block Types
 */
export const TIME_BLOCK_TYPES = {
  UNAVAILABLE: 'unavailable',
  BREAK: 'break',
  RESERVED: 'reserved',
} as const;

/**
 * Days of Week
 */
export const DAYS_OF_WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

/**
 * Days of Week Labels (Portuguese)
 */
export const DAYS_OF_WEEK_LABELS = {
  [DAYS_OF_WEEK.SUNDAY]: 'Domingo',
  [DAYS_OF_WEEK.MONDAY]: 'Segunda-feira',
  [DAYS_OF_WEEK.TUESDAY]: 'Terça-feira',
  [DAYS_OF_WEEK.WEDNESDAY]: 'Quarta-feira',
  [DAYS_OF_WEEK.THURSDAY]: 'Quinta-feira',
  [DAYS_OF_WEEK.FRIDAY]: 'Sexta-feira',
  [DAYS_OF_WEEK.SATURDAY]: 'Sábado',
} as const;

/**
 * Days of Week Short Labels (Portuguese)
 */
export const DAYS_OF_WEEK_SHORT = {
  [DAYS_OF_WEEK.SUNDAY]: 'Dom',
  [DAYS_OF_WEEK.MONDAY]: 'Seg',
  [DAYS_OF_WEEK.TUESDAY]: 'Ter',
  [DAYS_OF_WEEK.WEDNESDAY]: 'Qua',
  [DAYS_OF_WEEK.THURSDAY]: 'Qui',
  [DAYS_OF_WEEK.FRIDAY]: 'Sex',
  [DAYS_OF_WEEK.SATURDAY]: 'Sáb',
} as const;

/**
 * Validation Rules
 */
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 100,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  PHONE_LENGTH: 11, // Format: (XX) XXXXX-XXXX without formatting
  CPF_LENGTH: 11, // Without formatting
  EMAIL_MAX_LENGTH: 255,
} as const;

/**
 * Regex Patterns
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/,
  CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  FORBIDDEN: 'Você não tem permissão para esta ação.',
  NOT_FOUND: 'Recurso não encontrado.',
  INTERNAL_SERVER_ERROR: 'Erro no servidor. Tente novamente mais tarde.',
  VALIDATION_ERROR: 'Dados inválidos. Verifique os campos.',
  UNKNOWN_ERROR: 'Erro desconhecido. Tente novamente.',
} as const;

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login realizado com sucesso!',
  LOGOUT: 'Logout realizado com sucesso!',
  REGISTER: 'Cadastro realizado com sucesso!',
  PROFILE_UPDATED: 'Perfil atualizado com sucesso!',
  PASSWORD_CHANGED: 'Senha alterada com sucesso!',
  APPOINTMENT_CREATED: 'Agendamento criado com sucesso!',
  APPOINTMENT_CANCELLED: 'Agendamento cancelado com sucesso!',
  APPOINTMENT_CONFIRMED: 'Agendamento confirmado com sucesso!',
} as const;

/**
 * Animation Durations (in milliseconds)
 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

/**
 * Pagination
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

/**
 * Debounce Times (in milliseconds)
 */
export const DEBOUNCE_TIME = {
  SEARCH: 300,
  AUTO_SAVE: 1000,
  RESIZE: 150,
} as const;

/**
 * Theme Colors
 */
export const THEME_COLORS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  TERTIARY: 'tertiary',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
  LIGHT: 'light',
  MEDIUM: 'medium',
  DARK: 'dark',
} as const;

/**
 * Type exports for better TypeScript support
 */
export type AppointmentStatus = typeof APPOINTMENT_STATUS[keyof typeof APPOINTMENT_STATUS];
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export type TimeBlockType = typeof TIME_BLOCK_TYPES[keyof typeof TIME_BLOCK_TYPES];
export type DayOfWeek = typeof DAYS_OF_WEEK[keyof typeof DAYS_OF_WEEK];
export type ThemeColor = typeof THEME_COLORS[keyof typeof THEME_COLORS];
