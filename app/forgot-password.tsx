import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
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
                    { backgroundColor: colors.primary },
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
                    <ThemedText style={[styles.backLink, { color: colors.primary }]}>Back to Login</ThemedText>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <View style={styles.successContainer}>
                  <ThemedText style={[styles.successIcon, { color: colors.success }]}>✓</ThemedText>
                  <ThemedText style={styles.successTitle}>Check Your Email</ThemedText>
                  <ThemedText style={styles.successMessage}>
                    We've sent password reset instructions to the email address associated with your card number.
                  </ThemedText>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.submitButton,
                    { backgroundColor: colors.primary },
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 48,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 40,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  submitButtonPressed: {
    opacity: 0.8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  backContainer: {
    alignItems: 'center',
  },
  backLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 40,
  },
  successIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 24,
  },
  emailText: {
    fontWeight: '600',
  },
});

