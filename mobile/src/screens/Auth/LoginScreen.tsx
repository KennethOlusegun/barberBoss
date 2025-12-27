// src/screens/Auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/colors';
import { ERROR_MESSAGES } from '../../constants/messages';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================
const loginSchema = z.object({
  email: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .email(ERROR_MESSAGES.INVALID_EMAIL),
  password: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .min(6, ERROR_MESSAGES.PASSWORD_TOO_SHORT),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================================
// LOGIN SCREEN COMPONENT
// ============================================================================
export const LoginScreen: React.FC = () => {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  console.log('ðŸ–¥ï¸ LoginScreen rendered');

  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const onSubmit = async (data: LoginFormData) => {
    console.log('ðŸ“¤ Login attempt:', { email: data.email, password: '***' });

    setIsLoading(true);
    setErrorMessage('');

    try {
      await signIn(data.email, data.password);
      console.log('âœ… Login successful');
    } catch (error: any) {
      console.error('âŒ Login error:', error);

      if (!error.statusCode || error.statusCode === 0) {
        setErrorMessage('Erro de conexÃ£o. Verifique sua internet.');
      } else {
        setErrorMessage(
          error.message || 'Erro ao fazer login. Verifique suas credenciais.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Recuperar Senha',
      'Funcionalidade em desenvolvimento',
      [{ text: 'OK' }]
    );
  };

  const handleRegister = () => {
    Alert.alert(
      'Criar Conta',
      'Funcionalidade em desenvolvimento',
      [{ text: 'OK' }]
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Container opaco para prevenir ghost screen */}
      <View style={styles.opaqueContainer}>
        <LinearGradient
          colors={[COLORS.midnight_navy, COLORS.slate_grey]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* HEADER SECTION - SEM ANIMAÃ‡ÃƒO */}
              <View style={styles.headerSection}>
                {/* Logo Container */}
                <View style={[styles.logoContainer, SHADOWS.glowPrimary]}>
                  <MaterialCommunityIcons
                    name="scissors-cutting"
                    size={SIZES.iconXLarge}
                    color={COLORS.white_pure}
                  />
                </View>

                {/* App Title */}
                <Text style={styles.appTitle}>BarberBoss</Text>

                {/* Subtitle */}
                <Text style={styles.appSubtitle}>
                  Gerencie seu salÃ£o com facilidade
                </Text>
              </View>

              {/* FORM SECTION - SEM ANIMAÃ‡ÃƒO */}
              <View style={styles.formContainer}>
                {/* Email Input */}
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      icon="email-outline"
                      placeholder="E-mail"
                      keyboardType="email-address"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.email?.message}
                    />
                  )}
                />

                {/* Password Input */}
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      icon="lock"
                      placeholder="Senha"
                      showPasswordToggle={true}
                      secureTextEntry={true}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.password?.message}
                    />
                  )}
                />

                {/* Forgot Password Link */}
                <View style={styles.forgotPasswordSection}>
                  <TouchableOpacity
                    onPress={handleForgotPassword}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.forgotPasswordText}>
                      Esqueceu a senha?
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Error Alert */}
                {errorMessage ? (
                  <View style={styles.errorAlert}>
                    <View style={styles.errorBox}>
                      <MaterialCommunityIcons
                        name="alert-circle-outline"
                        size={24}
                        color={COLORS.vintage_red}
                      />
                      <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                  </View>
                ) : null}

                {/* Login Button */}
                <Button
                  title={isLoading ? 'Carregando...' : 'Entrar'}
                  onPress={handleSubmit(onSubmit)}
                  variant="primary"
                  size="large"
                  fullWidth={true}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.loginButton}
                />

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>ou</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Register Button */}
                <Button
                  title="Criar uma conta"
                  onPress={handleRegister}
                  variant="outline"
                  size="large"
                  fullWidth={true}
                  disabled={isLoading}
                />
              </View>

              {/* FOOTER SECTION */}
              <View style={styles.footerSection}>
                <Text style={styles.footerText}>
                  Ao continuar, vocÃª concorda com nossos{' '}
                  <Text style={styles.footerLink}>Termos de Uso</Text> e{' '}
                  <Text style={styles.footerLink}>PolÃ­tica de Privacidade</Text>
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.midnight_navy,
  },

  // Container opaco para prevenir ghost screen
  opaqueContainer: {
    flex: 1,
    backgroundColor: COLORS.midnight_navy,
  },

  gradient: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.xl,
  },

  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: SIZES.xxl,
  },

  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: SIZES.borderRadiusLarge,
    backgroundColor: COLORS.royal_blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },

  appTitle: {
    fontSize: SIZES.h1,
    color: COLORS.white_pure,
    marginBottom: SIZES.sm,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  appSubtitle: {
    fontSize: SIZES.h5,
    color: COLORS.grey_steel,
    textAlign: 'center',
    fontWeight: '400',
  },

  // Form Section
  formContainer: {
    flex: 1,
  },

  forgotPasswordSection: {
    alignItems: 'flex-end',
    marginBottom: SIZES.md,
  },

  forgotPasswordText: {
    fontSize: SIZES.small,
    color: COLORS.royal_blue,
    fontWeight: '700',
  },

  errorAlert: {
    marginBottom: SIZES.md,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    padding: SIZES.md,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.vintage_red + '1A',
    borderWidth: 1,
    borderColor: COLORS.vintage_red + '4D',
  },

  errorText: {
    fontSize: SIZES.small,
    color: COLORS.vintage_red,
    flex: 1,
    fontWeight: '400',
  },

  loginButton: {
    marginBottom: SIZES.md,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.md,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.grey_steel + '33',
  },

  dividerText: {
    fontSize: SIZES.small,
    color: COLORS.grey_steel,
    marginHorizontal: SIZES.md,
    fontWeight: '700',
  },

  // Footer Section
  footerSection: {
    marginTop: SIZES.xl,
    paddingTop: SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey_steel + '1A',
  },

  footerText: {
    fontSize: SIZES.small,
    color: COLORS.grey_steel,
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
  },

  footerLink: {
    color: COLORS.royal_blue,
    fontWeight: '700',
  },
});