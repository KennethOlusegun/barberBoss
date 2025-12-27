import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, FONTS } from '../../constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  // 🛡️ TYPE GUARDS: Força conversão segura para boolean
  const safeFullWidth = typeof fullWidth === 'string'
    ? fullWidth === 'true'
    : Boolean(fullWidth);

  const safeLoading = typeof loading === 'string'
    ? loading === 'true'
    : Boolean(loading);

  const safeDisabled = typeof disabled === 'string'
    ? disabled === 'true'
    : Boolean(disabled);

  const isDisabled = safeDisabled || safeLoading;

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          gradient: [COLORS.royal_blue, COLORS.royal_blue],
          text: COLORS.white_pure,
        };
      case 'secondary':
        return {
          gradient: [COLORS.slate_grey, COLORS.slate_grey],
          text: COLORS.white_pure,
        };
      case 'outline':
        return {
          gradient: null,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: COLORS.royal_blue,
          text: COLORS.royal_blue,
        };
      case 'danger':
        return {
          gradient: [COLORS.vintage_red, COLORS.vintage_red],
          text: COLORS.white_pure,
        };
      default:
        return {
          gradient: [COLORS.royal_blue, COLORS.royal_blue],
          text: COLORS.white_pure,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          height: 40,
          paddingHorizontal: SIZES.md,
          fontSize: SIZES.small,
        };
      case 'medium':
        return {
          height: 48,
          paddingHorizontal: SIZES.lg,
          fontSize: SIZES.body,
        };
      case 'large':
        return {
          height: 56,
          paddingHorizontal: SIZES.lg,
          fontSize: SIZES.body,
        };
      default:
        return {
          height: 48,
          paddingHorizontal: SIZES.lg,
          fontSize: SIZES.body,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const buttonStyle = [
    styles.button,
    {
      height: sizeStyles.height,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      // Corrige o tipo de width para DimensionValue
      ...(safeFullWidth ? { width: '100%' as const } : {}),
    },
    !variantStyles.gradient && {
      backgroundColor: variantStyles.backgroundColor,
      borderWidth: variantStyles.borderWidth,
      borderColor: variantStyles.borderColor,
    },
    isDisabled && styles.buttonDisabled,
    style,
  ];

  const textColor = isDisabled ? COLORS.grey_steel : variantStyles.text;

  const buttonContent = (
    <View style={styles.content}>
      {icon && iconPosition === 'left' && (
        <View style={styles.iconLeft}>{icon}</View>
      )}
      {safeLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text
          style={[
            styles.text,
            {
              fontSize: sizeStyles.fontSize,
              color: textColor,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
      {icon && iconPosition === 'right' && (
        <View style={styles.iconRight}>{icon}</View>
      )}
    </View>
  );

  if (variantStyles.gradient) {
    // Garante que gradient seja do tipo [ColorValue, ColorValue]
    const gradientColors = Array.isArray(variantStyles.gradient) && variantStyles.gradient.length >= 2
      ? [variantStyles.gradient[0], variantStyles.gradient[1]] as [string, string]
      : [COLORS.royal_blue, COLORS.royal_blue] as [string, string];
    return (
      <TouchableOpacity
        disabled={isDisabled}
        onPress={onPress}
        activeOpacity={isDisabled ? 1 : 0.8}
        style={buttonStyle}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradientContainer,
            {
              opacity: isDisabled ? 0.5 : 1,
            },
          ]}
        >
          {buttonContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      disabled={isDisabled}
      onPress={onPress}
      activeOpacity={isDisabled ? 1 : 0.8}
      style={buttonStyle}
    >
      {buttonContent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  gradientContainer: {
    flex: 1,
    borderRadius: SIZES.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    ...FONTS.bodySemiBold,
    textAlign: 'center',
    fontWeight: '700',
  },

  iconLeft: {
    marginRight: SIZES.sm,
  },

  iconRight: {
    marginLeft: SIZES.sm,
  },
});