import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const { resetPasswordByCardNumber, loading } = useAuth();
  
  const [cardNumber, setCardNumber] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleResetPassword = async () => {
    if (!cardNumber) {
      Alert.alert('Error', 'Please enter your card number');
      return;
    }

    try {
      await resetPasswordByCardNumber(cardNumber);
      setIsSubmitted(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Background Gradient Overlay */}
      <View style={styles.gradientOverlay}>
        <View style={[styles.circle, styles.circle1, { backgroundColor: '#00C8FC', opacity: isDark ? 0.08 : 0.12 }]} />
        <View style={[styles.circle, styles.circle2, { backgroundColor: '#00C8FC', opacity: isDark ? 0.08 : 0.12 }]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoWrapper}>
              {isDark && (
                <View style={styles.logoBackground} />
              )}
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.logo}
              />
            </View>

            {!isSubmitted ? (
              <>
                <ThemedText style={styles.title}>Forgot Password?</ThemedText>
                <ThemedText style={styles.subtitle}>
                  Enter your card number and we'll send you instructions to reset your password.
                </ThemedText>

                {/* Card Number Input */}
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.label}>Card Number</ThemedText>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        backgroundColor: colors.backgroundSecondary,
                        color: colors.text,
                      }
                    ]}
                    placeholder="Enter your card number"
                    placeholderTextColor={colors.textTertiary}
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>

                {/* Submit Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.submitButton,
                    { 
                      backgroundColor: '#00C8FC',
                      shadowColor: '#00C8FC',
                    },
                    (pressed || loading) && styles.submitButtonPressed,
                  ]}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <ThemedText style={styles.submitButtonText}>Reset Password</ThemedText>
                  )}
                </Pressable>

                {/* Back to Login Link */}
                <View style={styles.backContainer}>
                  <Pressable onPress={() => router.back()}>
                    <ThemedText style={[styles.backLink, { color: '#00C8FC' }]}>Back to Login</ThemedText>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <View style={styles.successContainer}>
                  <ThemedText style={[styles.successIcon, { color: '#00C8FC' }]}>✓</ThemedText>
                  <ThemedText style={styles.successTitle}>Check Your Email</ThemedText>
                  <ThemedText style={styles.successMessage}>
                    We've sent password reset instructions to the email address associated with your card number.
                  </ThemedText>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.submitButton,
                    { 
                      backgroundColor: '#00C8FC',
                      shadowColor: '#00C8FC',
                    },
                    pressed && styles.submitButtonPressed,
                  ]}
                  onPress={() => router.back()}
                >
                  <ThemedText style={styles.submitButtonText}>Back to Login</ThemedText>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
  },
  circle1: {
    width: 400,
    height: 400,
    top: -150,
    right: -150,
  },
  circle2: {
    width: 350,
    height: 350,
    bottom: -120,
    left: -120,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 32,
  },
  logoWrapper: {
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBackground: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    shadowColor: '#00C8FC',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 32,
    lineHeight: 22,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  inputContainer: {
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  input: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  backContainer: {
    alignItems: 'center',
  },
  backLink: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 32,
  },
  successIcon: {
    fontSize: 72,
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  emailText: {
    fontWeight: '600',
  },
});

