// src/screens/Auth/ResetPasswordScreen.tsx
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import apiClient from '../../api/apiClient';

// ============================================================================
// TYPES
// ============================================================================
type AuthStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string };
};

type ResetPasswordScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ResetPassword'
>;

type ResetPasswordScreenRouteProp = RouteProp<
  AuthStackParamList,
  'ResetPassword'
>;

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token Ã© obrigatÃ³rio'),
  newPassword: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .min(6, ERROR_MESSAGES.PASSWORD_TOO_SHORT),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ============================================================================
// RESET PASSWORD SCREEN COMPONENT
// ============================================================================
export const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();
  const route = useRoute<ResetPasswordScreenRouteProp>();
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
    setValue,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: '',
      newPassword: '',
    },
  });

  // ============================================================================
  // LIFECYCLE & ANIMATIONS
  // ============================================================================
  useEffect(() => {
    // Se o token vier pela rota (deep link), preenche automaticamente
    if (route.params?.token) {
      setValue('token', route.params.token);
    }

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
  }, [route.params?.token]);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const onSubmit = async (data: ResetPasswordFormData) => {
    console.log('ðŸ” Password reset attempt:', { token: '***', password: '***' });

    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await apiClient.post('/auth/reset-password', {
        token: data.token,
        newPassword: data.newPassword,
      });

      console.log('âœ… Password reset successfully');
      setSuccessMessage('Senha redefinida com sucesso!');

      // Redireciona para login apÃ³s 2 segundos
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    } catch (error: any) {
      console.error('âŒ Password reset error:', error);

      if (!error.response?.status || error.response?.status === 0) {
        setErrorMessage('Erro de conexÃ£o. Verifique sua internet.');
      } else {
        setErrorMessage(
          error.response?.data?.message || 'Erro ao redefinir senha. Token pode estar expirado.'
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
                  name="shield-lock-outline"
                  size={SIZES.iconXLarge}
                  color={COLORS.white_pure}
                />
              </View>

              {/* Page Title */}
              <Text style={styles.pageTitle}>Redefinir Senha</Text>

              {/* Subtitle */}
              <Text style={styles.pageSubtitle}>
                Crie uma nova senha para sua conta
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
              {/* Token Input */}
              <Controller
                control={control}
                name="token"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    icon="key-variant"
                    placeholder="Token de recuperaÃ§Ã£o"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.token?.message}
                  />
                )}
              />

              {/* New Password Input */}
              <Controller
                control={control}
                name="newPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    icon="lock"
                    placeholder="Nova senha (mÃ­nimo 6 caracteres)"
                    showPasswordToggle={true}
                    secureTextEntry={true}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.newPassword?.message}
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
                title={isLoading ? 'Redefinindo...' : 'Redefinir Senha'}
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
                  O token de recuperaÃ§Ã£o foi enviado para seu e-mail.
                  Caso nÃ£o tenha recebido, solicite um novo token.
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
  headerSection: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
    position: 'relative',
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
    fontWeight: '700',
  },
  pageSubtitle: {
    ...FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.grey_steel,
    textAlign: 'center',
    paddingHorizontal: SIZES.lg,
    lineHeight: 22,
    fontWeight: '400',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    padding: SIZES.sm,
  },
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
    fontWeight: '400',
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
    fontWeight: '400',
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
    fontWeight: '700',
  },
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
    fontWeight: '400',
  },
});