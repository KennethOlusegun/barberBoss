// src/screens/Auth/ForgotPasswordScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/colors';
import { ERROR_MESSAGES } from '../../constants/messages';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import apiClient from '../../api/apiClient';

// ============================================================================
// TYPES
// ============================================================================
type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
};

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .email(ERROR_MESSAGES.INVALID_EMAIL),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ============================================================================
// FORGOT PASSWORD SCREEN COMPONENT
// ============================================================================
export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(20);

  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  // ============================================================================
  // LIFECYCLE & ANIMATIONS
  // ============================================================================
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const onSubmit = async (data: ForgotPasswordFormData) => {
    console.log('ðŸ” Password recovery request:', { email: data.email });

    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await apiClient.post('/auth/forgot-password', {
        email: data.email,
      });

      console.log('âœ… Recovery email sent successfully');
      setSuccessMessage(
        'E-mail de recuperaÃ§Ã£o enviado! Verifique sua caixa de entrada.'
      );
    } catch (error: any) {
      console.error('âŒ Password recovery error:', error);

      if (!error.response?.status || error.response?.status === 0) {
        setErrorMessage('Erro de conexÃ£o. Verifique sua internet.');
      } else {
        setErrorMessage(
          error.response?.data?.message || 'Erro ao solicitar recuperaÃ§Ã£o de senha.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigation.navigate('Login');
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={[COLORS.midnight_navy + 'F2', COLORS.slate_grey + '80']}
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
            {/* HEADER SECTION */}
            <Animated.View
              style={[
                styles.headerSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleGoToLogin}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={28}
                  color={COLORS.white_pure}
                />
              </TouchableOpacity>

              {/* Icon Container */}
              <View style={[styles.iconContainer, SHADOWS.glowPrimary]}>
                <MaterialCommunityIcons
                  name="lock-reset"
                  size={SIZES.iconXLarge}
                  color={COLORS.white_pure}
                />
              </View>

              {/* Page Title */}
              <Text style={styles.pageTitle}>Recuperar Senha</Text>

              {/* Subtitle */}
              <Text style={styles.pageSubtitle}>
                Informe seu e-mail para receber as instruÃ§Ãµes de recuperaÃ§Ã£o
              </Text>
            </Animated.View>

            {/* FORM SECTION */}
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Email Input */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    icon="email-outline"
                    placeholder="E-mail cadastrado"
                    keyboardType="email-address"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                  />
                )}
              />

              {/* Success Alert */}
              {successMessage ? (
                <View style={styles.successAlert}>
                  <View style={styles.successBox}>
                    <MaterialCommunityIcons
                      name="check-circle-outline"
                      size={24}
                      color={COLORS.success}
                    />
                    <Text style={styles.successText}>{successMessage}</Text>
                  </View>
                </View>
              ) : null}

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

              {/* Submit Button */}
              <Button
                title={isLoading ? 'Enviando...' : 'Enviar recuperaÃ§Ã£o'}
                onPress={handleSubmit(onSubmit)}
                variant="primary"
                size="large"
                fullWidth={true}
                loading={isLoading}
                disabled={isLoading || !!successMessage}
                style={styles.submitButton}
              />

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Back to Login Button */}
              <Button
                title="Voltar para Login"
                onPress={handleGoToLogin}
                variant="outline"
                size="large"
                fullWidth={true}
                disabled={isLoading}
              />
            </Animated.View>

            {/* INFO SECTION */}
            <View style={styles.infoSection}>
              <View style={styles.infoBox}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={20}
                  color={COLORS.royal_blue}
                />
                <Text style={styles.infoText}>
                  VocÃª receberÃ¡ um e-mail com instruÃ§Ãµes para criar uma nova senha.
                  Verifique tambÃ©m sua pasta de spam.
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
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
    marginBottom: SIZES.xl,
    position: 'relative',
  },

  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    padding: SIZES.sm,
  },

  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: SIZES.borderRadiusLarge,
    backgroundColor: COLORS.royal_blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
    marginTop: SIZES.xl,
  },

  pageTitle: {
    ...FONTS.heading,
    fontSize: SIZES.h2,
    color: COLORS.white_pure,
    marginBottom: SIZES.sm,
    textTransform: 'uppercase',
  },

  pageSubtitle: {
    ...FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.grey_steel,
    textAlign: 'center',
    paddingHorizontal: SIZES.lg,
    lineHeight: 22,
  },

  // Form Section
  formContainer: {
    flex: 1,
  },

  successAlert: {
    marginBottom: SIZES.md,
  },

  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    padding: SIZES.md,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.success + '1A',
    borderWidth: 1,
    borderColor: COLORS.success + '4D',
  },

  successText: {
    ...FONTS.bodyMedium,
    fontSize: SIZES.small,
    color: COLORS.success,
    flex: 1,
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
    ...FONTS.bodyMedium,
    fontSize: SIZES.small,
    color: COLORS.vintage_red,
    flex: 1,
  },

  submitButton: {
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
    ...FONTS.bodyMedium,
    fontSize: SIZES.small,
    color: COLORS.grey_steel,
    marginHorizontal: SIZES.md,
  },

  // Info Section
  infoSection: {
    marginTop: SIZES.xl,
    paddingTop: SIZES.lg,
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.sm,
    padding: SIZES.md,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.royal_blue + '1A',
    borderWidth: 1,
    borderColor: COLORS.royal_blue + '33',
  },

  infoText: {
    ...FONTS.body,
    fontSize: SIZES.small,
    color: COLORS.grey_steel,
    flex: 1,
    lineHeight: 20,
  },
});