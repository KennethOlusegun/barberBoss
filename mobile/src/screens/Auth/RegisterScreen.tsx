// src/screens/Auth/RegisterScreen.tsx
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
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { COLORS, SIZES, FONTS, SHADOWS } from '../../constants/colors';
import { ERROR_MESSAGES } from '../../constants/messages';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

// ============================================================================
// TYPES
// ============================================================================
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Register'
>;

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================
const registerSchema = z.object({
  name: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .email(ERROR_MESSAGES.INVALID_EMAIL),
  password: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .min(6, ERROR_MESSAGES.PASSWORD_TOO_SHORT),
});

type RegisterFormData = z.infer<typeof registerSchema>;

// ============================================================================
// REGISTER SCREEN COMPONENT
// ============================================================================
export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(20);

  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
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
  const onSubmit = async (data: RegisterFormData) => {
    console.log('ðŸ“ Register attempt:', { 
      name: data.name, 
      email: data.email, 
      password: '***' 
    });

    setIsLoading(true);
    setErrorMessage('');

    try {
      await signUp(data.email, data.password, data.name);
      console.log('âœ… Registration successful');
      // O AuthContext jÃ¡ faz o login automÃ¡tico apÃ³s o registro
      // A navegaÃ§Ã£o serÃ¡ automÃ¡tica via NavigationContainer
    } catch (error: any) {
      console.error('âŒ Registration error:', error);

      if (!error.statusCode || error.statusCode === 0) {
        setErrorMessage('Erro de conexÃ£o. Verifique sua internet.');
      } else {
        setErrorMessage(
          error.message || 'Erro ao criar conta. Tente novamente.'
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

              {/* Logo Container */}
              <View style={[styles.logoContainer, SHADOWS.glowPrimary]}>
                <MaterialCommunityIcons
                  name="account-plus-outline"
                  size={SIZES.iconXLarge}
                  color={COLORS.white_pure}
                />
              </View>

              {/* Page Title */}
              <Text style={styles.pageTitle}>Criar Conta</Text>

              {/* Subtitle */}
              <Text style={styles.pageSubtitle}>
                Junte-se ao BarberBoss e gerencie seu negÃ³cio
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
              {/* Name Input */}
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    icon="account-outline"
                    placeholder="Nome completo"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.name?.message}
                  />
                )}
              />

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
                    placeholder="Senha (mÃ­nimo 6 caracteres)"
                    showPasswordToggle={true}
                    secureTextEntry={true}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />
                )}
              />

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

              {/* Register Button */}
              <Button
                title={isLoading ? 'Criando conta...' : 'Cadastrar'}
                onPress={handleSubmit(onSubmit)}
                variant="primary"
                size="large"
                fullWidth={true}
                loading={isLoading}
                disabled={isLoading}
                style={styles.registerButton}
              />

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Login Button */}
              <Button
                title="JÃ¡ tenho uma conta"
                onPress={handleGoToLogin}
                variant="outline"
                size="large"
                fullWidth={true}
                disabled={isLoading}
              />
            </Animated.View>

            {/* FOOTER SECTION */}
            <View style={styles.footerSection}>
              <Text style={styles.footerText}>
                Ao criar uma conta, vocÃª concorda com nossos{' '}
                <Text style={styles.footerLink}>Termos de Uso</Text> e{' '}
                <Text style={styles.footerLink}>PolÃ­tica de Privacidade</Text>
              </Text>
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

  logoContainer: {
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
  },

  // Form Section
  formContainer: {
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

  registerButton: {
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

  // Footer Section
  footerSection: {
    marginTop: SIZES.xl,
    paddingTop: SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey_steel + '1A',
  },

  footerText: {
    ...FONTS.body,
    fontSize: SIZES.small,
    color: COLORS.grey_steel,
    textAlign: 'center',
    lineHeight: 20,
  },

  footerLink: {
    ...FONTS.bodySemiBold,
    color: COLORS.royal_blue,
  },
});