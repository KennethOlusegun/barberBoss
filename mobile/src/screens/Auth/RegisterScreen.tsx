// src/screens/Auth/RegisterScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import { Input } from "../../components/common/Input";
import Button from "../../components/common/Button";
import { COLORS, SIZES, FONTS, SHADOWS } from "../../constants/colors";
import { ERROR_MESSAGES } from "../../constants/messages";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

// ============================================================================
// TYPES
// ============================================================================
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Register"
>;

// ============================================================================
// VALIDATION SCHEMA (movido para fora do componente)
// ============================================================================
const registerSchema = z.object({
  name: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .min(3, "Nome deve ter pelo menos 3 caracteres"),
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
const RegisterScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Animation values - inicializados com useRef para evitar re-renders
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
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
  }, [fadeAnim, slideAnim]);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  const onSubmit = async (data: RegisterFormData) => {
    console.log("📝 Register attempt:", {
      name: data.name,
      email: data.email,
      password: "***",
    });

    setIsLoading(true);
    setErrorMessage("");

    try {
      await signUp(data.email, data.password, data.name);
      console.log("✅ Registration successful");
      // O AuthContext já faz o login automático após o registro
      // A navegação será automática via NavigationContainer
    } catch (error: any) {
      console.error("❌ Registration error:", error);

      if (!error.statusCode || error.statusCode === 0) {
        setErrorMessage("Erro de conexão. Verifique sua internet.");
      } else {
        setErrorMessage(
          error.message || "Erro ao criar conta. Tente novamente.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigation.navigate("Login");
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.midnight_navy + "F2", COLORS.slate_grey + "80"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: insets.top + (SIZES.xl || 32),
                paddingBottom: insets.bottom + (SIZES.xl || 32),
              },
            ]}
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
                  size={SIZES.iconXLarge || 48}
                  color={COLORS.white_pure}
                />
              </View>

              {/* Page Title */}
              <Text style={styles.pageTitle}>Criar Conta</Text>

              {/* Subtitle */}
              <Text style={styles.pageSubtitle}>
                Junte-se ao BarberBoss e gerencie seu negócio
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
                    placeholder="Senha (mínimo 6 caracteres)"
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
                title={isLoading ? "Criando conta..." : "Cadastrar"}
                onPress={handleSubmit(onSubmit)}
                variant="primary"
                size="large"
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
                title="Já tenho uma conta"
                onPress={handleGoToLogin}
                variant="outline"
                size="large"
                disabled={isLoading}
              />
            </Animated.View>

            {/* FOOTER SECTION */}
            <View style={styles.footerSection}>
              <Text style={styles.footerText}>
                Ao criar uma conta, você concorda com nossos{" "}
                <Text style={styles.footerLink}>Termos de Uso</Text> e{" "}
                <Text style={styles.footerLink}>Política de Privacidade</Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
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
    paddingHorizontal: SIZES.lg || 24,
  },

  // Header Section
  headerSection: {
    alignItems: "center",
    marginBottom: SIZES.xl || 32,
    position: "relative",
  },

  backButton: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 10,
    padding: SIZES.sm || 12,
  },

  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: SIZES.borderRadiusLarge || 20,
    backgroundColor: COLORS.royal_blue,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.lg || 24,
    marginTop: SIZES.xl || 32,
  },

  pageTitle: {
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    fontSize: 28,
    color: COLORS.white_pure,
    marginBottom: SIZES.xs || 8,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },

  pageSubtitle: {
    fontFamily: "Inter_400Regular",
    fontWeight: "400",
    fontSize: 16,
    color: COLORS.grey_steel,
    textAlign: "center",
    paddingHorizontal: SIZES.md || 16,
  },

  // Form Section
  formContainer: {
    flex: 1,
  },

  errorAlert: {
    marginBottom: SIZES.md || 16,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.sm || 12,
    padding: SIZES.md || 16,
    borderRadius: SIZES.borderRadius || 8,
    backgroundColor: COLORS.vintage_red + "1A",
    borderWidth: 1,
    borderColor: COLORS.vintage_red + "4D",
  },

  errorText: {
    fontFamily: "Inter_400Regular",
    fontWeight: "400",
    fontSize: SIZES.small || 12,
    color: COLORS.vintage_red,
    flex: 1,
  },

  registerButton: {
    marginBottom: SIZES.md || 16,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SIZES.md || 16,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.grey_steel + "33",
  },

  dividerText: {
    fontFamily: "Inter_500Medium",
    fontWeight: "500",
    color: COLORS.grey_steel,
    marginHorizontal: SIZES.md || 16,
  },

  // Footer Section
  footerSection: {
    marginTop: SIZES.xl || 32,
    paddingTop: SIZES.lg || 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.grey_steel + "1A",
  },

  footerText: {
    fontFamily: "Inter_400Regular",
    fontWeight: "400",
    fontSize: SIZES.small || 12,
    color: COLORS.grey_steel,
    textAlign: "center",
    lineHeight: 20,
  },

  footerLink: {
    fontFamily: "Inter_600SemiBold",
    fontWeight: "600",
    color: COLORS.royal_blue,
  },
});

export default RegisterScreen;
