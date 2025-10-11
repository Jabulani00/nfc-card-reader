import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';

export default function AddUserScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const initialType = params.type === 'staff' ? false : true;
  
  const [isStudent, setIsStudent] = useState(initialType);
  const [FirstName, setFirstName] = useState('');
  const [LastName, setLastName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleAddUser = () => {
    // Validation
    if (!FirstName || !LastName || !cardNumber || !email || !department || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Simulate adding user
    Alert.alert(
      'Success',
      `${isStudent ? 'Student' : 'Staff member'} "${FirstName} ${LastName}" has been added successfully.`,
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <ThemedText style={styles.title}>Add New User</ThemedText>
            <ThemedText style={styles.subtitle}>Fill in the details below</ThemedText>

            {/* Student/Staff Toggle */}
            <View style={[styles.toggleContainer, { backgroundColor: `${colors.primary}15` }]}>
              <ThemedText style={styles.toggleLabel}>User Type:</ThemedText>
              <View style={styles.toggleRow}>
                <ThemedText style={[styles.toggleText, !isStudent && styles.toggleTextActive]}>
                  Staff
                </ThemedText>
                <Switch
                  value={isStudent}
                  onValueChange={setIsStudent}
                  trackColor={{ false: colors.warning, true: colors.info }}
                  thumbColor="#FFFFFF"
                />
                <ThemedText style={[styles.toggleText, isStudent && styles.toggleTextActive]}>
                  Student
                </ThemedText>
              </View>
            </View>

            {/* First Name Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>First Name *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                    borderColor: colors.border,
                  }
                ]}
                placeholder="Enter first name"
                placeholderTextColor={colors.textTertiary}
                value={FirstName}
                onChangeText={setFirstName}
              />
            </View>

            {/* Last Name Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Last Name *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                    borderColor: colors.border,
                  }
                ]}
                placeholder="Enter last name"
                placeholderTextColor={colors.textTertiary}
                value={LastName}
                onChangeText={setLastName}
              />
            </View>

            {/* Card Number Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>
                {isStudent ? 'Student Card Number *' : 'Staff Card Number *'}
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                    borderColor: colors.border,
                  }
                ]}
                placeholder={`Enter ${isStudent ? 'student' : 'staff'} card number`}
                placeholderTextColor={colors.textTertiary}
                value={cardNumber}
                onChangeText={setCardNumber}
                autoCapitalize="none"
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Email *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                    borderColor: colors.border,
                  }
                ]}
                placeholder="Enter email address"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Department Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Department *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                    borderColor: colors.border,
                  }
                ]}
                placeholder="Enter department"
                placeholderTextColor={colors.textTertiary}
                value={department}
                onChangeText={setDepartment}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Password *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                    borderColor: colors.border,
                  }
                ]}
                placeholder="Enter password"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Confirm Password *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    color: colors.text,
                    borderColor: colors.border,
                  }
                ]}
                placeholder="Confirm password"
                placeholderTextColor={colors.textTertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  { 
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                  },
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => router.back()}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  { backgroundColor: colors.primary },
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleAddUser}
              >
                <ThemedText style={styles.submitButtonText}>Add User</ThemedText>
              </Pressable>
            </View>
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
    paddingTop: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
  },
  toggleContainer: {
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  toggleText: {
    fontSize: 16,
    opacity: 0.5,
  },
  toggleTextActive: {
    fontWeight: '600',
    opacity: 1,
  },
  inputContainer: {
    marginBottom: 20,
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
    borderWidth: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.8,
  },
});

