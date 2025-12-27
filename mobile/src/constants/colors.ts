// src/constants/colors.ts

/**
 * ============================================================================
 * DESIGN SYSTEM "MODERN CLASSIC" - BarberBoss
 * Dark Mode Premium + Estética Clássica de Barbearia
 * ============================================================================
 */

// ============================================================================
// 1. PALETA DE CORES - DESIGN SYSTEM MODERN CLASSIC
// ============================================================================

export const COLORS = {
  // Cores Base - Dark Mode Premium
  midnight_navy: '#0b1120',
  slate_grey: '#1e293b',
  royal_blue: '#3b82f6',
  vintage_red: '#ef4444',
  white_pure: '#ffffff',
  grey_steel: '#94a3b8',

  // Cores Primárias
  primary: '#3b82f6',
  primaryShade: '#3367d6',
  primaryTint: '#4f8cff',

  // Cores Secundárias
  secondary: '#ef4444',
  secondaryShade: '#d63d3d',
  secondaryTint: '#f15555',

  // Estados
  success: '#10b981',
  successShade: '#0d9e71',
  successTint: '#28c68e',

  danger: '#ef4444',
  dangerShade: '#d63d3d',
  dangerTint: '#f15555',

  warning: '#f59e0b',
  warningShade: '#dc860d',
  warningTint: '#f7a623',

  info: '#3b82f6',

  // Backgrounds
  background: '#0b1120',
  surface: '#1e293b',

  // Text
  text: '#94a3b8',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',

  // Border
  border: '#1e293b',

  // Transparent overlays
  overlay: 'rgba(11, 17, 32, 0.95)',
  overlayLight: 'rgba(30, 41, 59, 0.5)',
};

// ============================================================================
// 2. TAMANHOS E ESPAÇAMENTOS
// ============================================================================

export const SIZES = {
  // Padding
  padding: 16,
  paddingSmall: 12,
  paddingLarge: 24,

  // Border Radius
  borderRadius: 8,
  borderRadiusSmall: 4,
  borderRadiusLarge: 12,
  borderRadiusXLarge: 16,
  borderRadiusFull: 9999,

  // Font Sizes
  h1: 40, // 2.5rem
  h2: 32, // 2rem
  h3: 24, // 1.5rem
  h4: 20, // 1.25rem
  h5: 18, // 1.125rem
  h6: 16, // 1rem
  body: 16, // 1rem
  small: 14, // 0.875rem
  tiny: 12, // 0.75rem

  // Spacing Scale
  xs: 4, // 0.25rem
  sm: 8, // 0.5rem
  md: 16, // 1rem
  lg: 24, // 1.5rem
  xl: 32, // 2rem
  xxl: 48, // 3rem

  // Icon Sizes
  iconSmall: 18,
  iconMedium: 22,
  iconLarge: 28,
  iconXLarge: 56,

  // Button Heights
  buttonSmall: 40,
  buttonMedium: 50,
  buttonLarge: 56,
};

// ============================================================================
// 3. FONTES - CORRIGIDO: Removido 'as const'
// ============================================================================

export const FONTS = {
  // Headings - Oswald (Bold, Condensed, Uppercase)
  heading: {
    fontFamily: 'Oswald_700Bold',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Body - Inter (Clean, Modern)
  body: {
    fontFamily: 'Inter_400Regular',
    fontWeight: '400',
  },

  bodyMedium: {
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
  },

  bodySemiBold: {
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },

  bodyBold: {
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
};

// ============================================================================
// 4. SOMBRAS
// ============================================================================

export const SHADOWS = {
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },

  // Glow Effects
  glowPrimary: {
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },

  glowDanger: {
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
};

// ============================================================================
// 5. TRANSIÇÕES
// ============================================================================

export const TRANSITIONS = {
  fast: 150,
  base: 300,
  slow: 500,
};