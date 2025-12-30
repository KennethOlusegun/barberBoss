// src/screens/Auth/ForgotPasswordScreen.tsx
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
import { Input } from "../../components/common/Input";
import Button from "../../components/common/Button"; // CORRIGIDO: import default
import { COLORS, SIZES, FONTS, SHADOWS } from "../../constants/colors";
import { ERROR_MESSAGES } from "../../constants/messages";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import apiClient from "../../api/apiClient";

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
  "ForgotPassword"
>;

type Step = "request" | "reset";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================
const requestCodeSchema = z.object({
  email: z
    .string()
    .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
    .email(ERROR_MESSAGES.INVALID_EMAIL),
});

const resetPasswordSchema = z
  .object({
    code: z
      .string()
      .min(1, "Código é obrigatório")
      .length(6, "Código deve ter 6 dígitos"),
    newPassword: z
      .string()
      .min(1, ERROR_MESSAGES.REQUIRED_FIELD)
      .min(6, ERROR_MESSAGES.PASSWORD_TOO_SHORT),
    confirmPassword: z.string().min(1, "Confirmação é obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RequestCodeFormData = z.infer<typeof requestCodeSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ============================================================================
// FORGOT PASSWORD SCREEN COMPONENT
// ============================================================================
const ForgotPasswordScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(0);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  const requestForm = useForm<RequestCodeFormData>({
    resolver: zodResolver(requestCodeSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: "", newPassword: "", confirmPassword: "" },
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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

  // Nova versão: limpa a mensagem de sucesso após 3 segundos
  const onRequestCode = async (data: RequestCodeFormData) => {
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      await apiClient.post("/auth/forgot-password", {
        email: data.email.toLowerCase(),
      });
      setEmail(data.email.toLowerCase());
      setStep("reset");
      setCountdown(60);
      setSuccessMessage("Código enviado! Verifique seu email.");
      // ✅ Limpa a mensagem após 3 segundos
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error: any) {
      console.error("Erro ao solicitar código:", error);
      if (!error.response?.status) {
        setErrorMessage("Erro de conexão. Verifique sua internet.");
      } else {
        setErrorMessage(
          error.response?.data?.message || "Erro ao enviar código.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    try {
      // Rota correta do backend: /api/auth/reset-password
      await apiClient.post("/auth/reset-password", {
        email: email,
        code: data.code,
        newPassword: data.newPassword,
      });
      setSuccessMessage("Senha redefinida com sucesso!");
      setTimeout(() => {
        navigation.navigate("Login");
      }, 2000);
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      if (!error.response?.status) {
        setErrorMessage("Erro de conexão. Verifique sua internet.");
      } else {
        setErrorMessage(
          error.response?.data?.message ||
            "Código inválido ou expirado. Solicite um novo.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      // Rota correta: /auth/password/forgot
      await apiClient.post("/auth/forgot-password", { email });
      setCountdown(60);
      setSuccessMessage("Novo código enviado!");
    } catch (error: any) {
      console.error("Erro ao reenviar código:", error);
      setErrorMessage("Erro ao reenviar código.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setStep("request");
    setEmail("");
    setErrorMessage("");
    setSuccessMessage("");
    resetForm.reset();
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

              <View style={[styles.iconContainer, SHADOWS.glowPrimary]}>
                <MaterialCommunityIcons
                  name={
                    step === "request" ? "lock-reset" : "shield-lock-outline"
                  }
                  size={SIZES.iconXLarge || 48}
                  color={COLORS.white_pure}
                />
              </View>

              <Text style={styles.pageTitle}>
                {step === "request" ? "Recuperar Senha" : "Criar Nova Senha"}
              </Text>

              <Text style={styles.pageSubtitle}>
                {step === "request"
                  ? "Informe seu e-mail para receber o código de recuperação"
                  : "Digite o código recebido e sua nova senha"}
              </Text>

              {/* Email Badge (Step 2) */}
              {step === "reset" && (
                <View style={styles.emailBadge}>
                  <MaterialCommunityIcons
                    name="email-check-outline"
                    size={16}
                    color={COLORS.royal_blue}
                  />
                  <Text style={styles.emailBadgeText}>{email}</Text>
                  <TouchableOpacity onPress={handleChangeEmail}>
                    <MaterialCommunityIcons
                      name="pencil"
                      size={16}
                      color={COLORS.royal_blue}
                    />
                  </TouchableOpacity>
                </View>
              )}
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
              {step === "request" && (
                <>
                  <Controller
                    control={requestForm.control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        icon="email-outline"
                        placeholder="E-mail cadastrado"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={requestForm.formState.errors.email?.message}
                      />
                    )}
                  />
                  <Button
                    title={isLoading ? "Enviando..." : "Enviar Código"}
                    onPress={requestForm.handleSubmit(onRequestCode)}
                    variant="primary"
                    size="large"
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.submitButton}
                  />
                </>
              )}

              {step === "reset" && (
                <>
                  <Controller
                    control={resetForm.control}
                    name="code"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        icon="key-variant"
                        placeholder="Código (6 dígitos)"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={resetForm.formState.errors.code?.message}
                      />
                    )}
                  />

                  <Controller
                    control={resetForm.control}
                    name="newPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        icon="lock"
                        placeholder="Nova senha (mínimo 6 caracteres)"
                        showPasswordToggle={true}
                        secureTextEntry={true}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={resetForm.formState.errors.newPassword?.message}
                      />
                    )}
                  />

                  <Controller
                    control={resetForm.control}
                    name="confirmPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        icon="lock-check"
                        placeholder="Confirmar nova senha"
                        showPasswordToggle={true}
                        secureTextEntry={true}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={
                          resetForm.formState.errors.confirmPassword?.message
                        }
                      />
                    )}
                  />

                  <View style={styles.resendSection}>
                    <Text style={styles.resendText}>
                      Não recebeu o código?{" "}
                    </Text>
                    <TouchableOpacity
                      onPress={handleResendCode}
                      disabled={countdown > 0 || isLoading}
                    >
                      <Text
                        style={[
                          styles.resendLink,
                          (countdown > 0 || isLoading) &&
                            styles.resendLinkDisabled,
                        ]}
                      >
                        {countdown > 0
                          ? `Reenviar em ${countdown}s`
                          : "Reenviar código"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Button
                    title={isLoading ? "Redefinindo..." : "Redefinir Senha"}
                    onPress={resetForm.handleSubmit(onResetPassword)}
                    variant="primary"
                    size="large"
                    loading={isLoading}
                    disabled={isLoading || !!successMessage}
                    style={styles.submitButton}
                  />
                </>
              )}

              {/* Alerts */}
              {successMessage ? (
                <View style={styles.successAlert}>
                  <View style={styles.successBox}>
                    <MaterialCommunityIcons
                      name="check-circle-outline"
                      size={24}
                      color={COLORS.success || "#22C55E"}
                    />
                    <Text style={styles.successText}>{successMessage}</Text>
                  </View>
                </View>
              ) : null}

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

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <Button
                title="Voltar para Login"
                onPress={handleGoToLogin}
                variant="outline"
                size="large"
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
                  {step === "request"
                    ? "Você receberá um código de 6 dígitos no seu email. O código expira em 15 minutos."
                    : "Digite o código recebido no email. Caso não encontre, verifique a pasta de spam."}
                </Text>
              </View>
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
  iconContainer: {
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
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    fontSize: SIZES.h2 || 24,
    color: COLORS.white_pure,
    marginBottom: SIZES.sm || 12,
    textTransform: "uppercase",
  },
  pageSubtitle: {
    fontFamily: "Inter_400Regular",
    fontWeight: "400",
    fontSize: SIZES.body || 16,
    color: COLORS.grey_steel,
    textAlign: "center",
    paddingHorizontal: SIZES.lg || 24,
    lineHeight: 22,
  },
  emailBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.xs || 8,
    marginTop: SIZES.md || 16,
    paddingHorizontal: SIZES.md || 16,
    paddingVertical: SIZES.sm || 12,
    backgroundColor: COLORS.royal_blue + "1A",
    borderRadius: SIZES.borderRadius || 8,
    borderWidth: 1,
    borderColor: COLORS.royal_blue + "33",
  },
  emailBadgeText: {
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    fontSize: SIZES.small || 12,
    color: COLORS.grey_steel,
  },
  formContainer: {
    width: "100%",
    marginBottom: SIZES.lg || 24,
  },
  resendSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SIZES.md || 16,
  },
  resendText: {
    fontFamily: "Inter_400Regular",
    fontWeight: "400",
    fontSize: SIZES.small || 12,
    color: COLORS.grey_steel,
  },
  resendLink: {
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    fontSize: SIZES.small || 12,
    color: COLORS.royal_blue,
  },
  resendLinkDisabled: {
    color: COLORS.grey_steel,
  },
  successAlert: {
    marginBottom: SIZES.md || 16,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.sm || 12,
    padding: SIZES.md || 16,
    borderRadius: SIZES.borderRadius || 8,
    backgroundColor: "#22C55E1A",
    borderWidth: 1,
    borderColor: "#22C55E4D",
  },
  successText: {
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    fontSize: SIZES.small || 12,
    color: COLORS.success || "#22C55E",
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
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    fontSize: SIZES.small || 12,
    color: COLORS.vintage_red,
    flex: 1,
  },
  submitButton: {
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
    fontFamily: "Inter_700Bold",
    fontWeight: "700",
    fontSize: SIZES.small || 12,
    color: COLORS.grey_steel,
    marginHorizontal: SIZES.md || 16,
  },
  infoSection: {
    marginTop: SIZES.xl || 32,
    paddingTop: SIZES.lg || 24,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SIZES.sm || 12,
    padding: SIZES.md || 16,
    borderRadius: SIZES.borderRadius || 8,
    backgroundColor: COLORS.royal_blue + "1A",
    borderWidth: 1,
    borderColor: COLORS.royal_blue + "33",
  },
  infoText: {
    fontFamily: "Inter_400Regular",
    fontWeight: "400",
    fontSize: SIZES.small || 12,
    color: COLORS.grey_steel,
    flex: 1,
    lineHeight: 20,
  },
});

export default ForgotPasswordScreen;
