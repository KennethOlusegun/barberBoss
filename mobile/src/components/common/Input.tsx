import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/colors';

interface InputProps extends TextInputProps {
  icon?: any;
  error?: string;
  showPasswordToggle?: boolean;
  containerStyle?: any;
}

export const Input: React.FC<InputProps> = ({
  icon,
  error,
  showPasswordToggle = false,
  containerStyle,
  secureTextEntry: initialSecureTextEntry = false,
  ...props
}) => {
  // Type guard: garante booleano para secureTextEntry
  const initialSecure = typeof initialSecureTextEntry === 'string'
    ? initialSecureTextEntry === 'true'
    : !!initialSecureTextEntry;
  // Type guard: garante booleano para showPasswordToggle
  const showToggle = typeof showPasswordToggle === 'string'
    ? showPasswordToggle === 'true'
    : !!showPasswordToggle;
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!initialSecure);

  const isSecure = !!showToggle && !showPassword;
  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          hasError && styles.inputWrapperError,
        ]}
      >
        {icon && (
          <MaterialCommunityIcons
            name={icon}
            size={SIZES.iconMedium}
            color={isFocused ? COLORS.royal_blue : COLORS.grey_steel}
            style={styles.icon}
          />
        )}

        <TextInput
          {...props}
          secureTextEntry={!!isSecure}
          style={[styles.input, icon && styles.inputWithIcon]}
          placeholderTextColor={COLORS.grey_steel + '99'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {showPasswordToggle && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={SIZES.iconMedium}
              color={COLORS.grey_steel}
              style={styles.toggleIcon}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SIZES.md,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.midnight_navy + '4D',
    borderWidth: 1.5,
    borderColor: COLORS.grey_steel + '4D',
    paddingHorizontal: SIZES.md,
    height: 56,
  },

  inputWrapperFocused: {
    borderColor: COLORS.royal_blue,
    backgroundColor: COLORS.midnight_navy + '66',
  },

  inputWrapperError: {
    borderColor: COLORS.vintage_red,
    backgroundColor: COLORS.vintage_red + '0D',
  },

  icon: {
    marginRight: SIZES.md,
  },

  input: {
    flex: 1,
    ...FONTS.body,
    fontSize: SIZES.body,
    color: COLORS.white_pure,
    padding: 0,
  },

  inputWithIcon: {
    marginLeft: SIZES.sm,
  },

  toggleIcon: {
    marginLeft: SIZES.md,
  },

  errorText: {
    ...FONTS.bodyMedium,
    fontSize: SIZES.small,
    color: COLORS.vintage_red,
    marginTop: SIZES.xs,
    paddingHorizontal: SIZES.xs,
    fontWeight: '400',
  },
});
