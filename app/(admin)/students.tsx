import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

interface Student {
  id: string;
  name: string;
  email: string;
  studentNumber: string;
  department: string;
  isActive: boolean;
}

// Mock data
const mockStudents: Student[] = [
  { id: '1', name: 'John Doe', email: 'john@university.edu', studentNumber: 'ST001', department: 'Computer Science', isActive: true },
  { id: '2', name: 'Jane Smith', email: 'jane@university.edu', studentNumber: 'ST002', department: 'Engineering', isActive: true },
  { id: '3', name: 'Mike Johnson', email: 'mike@university.edu', studentNumber: 'ST003', department: 'Business', isActive: false },
  { id: '4', name: 'Sarah Williams', email: 'sarah@university.edu', studentNumber: 'ST004', department: 'Medicine', isActive: true },
];

export default function StudentsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const activateBulk = () => {
    setStudents(students.map(s => 
      selectedIds.has(s.id) ? { ...s, isActive: true } : s
    ));
    setSelectedIds(new Set());
    Alert.alert('Success', `Activated ${selectedIds.size} student(s)`);
  };

  const revokeBulk = () => {
    setStudents(students.map(s => 
      selectedIds.has(s.id) ? { ...s, isActive: false } : s
    ));
    setSelectedIds(new Set());
    Alert.alert('Success', `Revoked access for ${selectedIds.size} student(s)`);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header Actions */}
      <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: colors.background,
            color: colors.text,
            borderColor: colors.border,
          }]}
          placeholder="Search students..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/add-user?type=student')}
          >
            <ThemedText style={styles.buttonText}>+ Add Student</ThemedText>
          </Pressable>
          
          <Pressable
            style={[styles.button, { backgroundColor: colors.secondary }]}
            onPress={activateBulk}
            disabled={selectedIds.size === 0}
          >
            <ThemedText style={[styles.buttonText, selectedIds.size === 0 && styles.buttonTextDisabled]}>
              Activate ({selectedIds.size})
            </ThemedText>
          </Pressable>
          
          <Pressable
            style={[styles.button, { backgroundColor: colors.danger }]}
            onPress={revokeBulk}
            disabled={selectedIds.size === 0}
          >
            <ThemedText style={[styles.buttonText, selectedIds.size === 0 && styles.buttonTextDisabled]}>
              Revoke ({selectedIds.size})
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Select All */}
        <Pressable
          style={[styles.selectAllRow, { backgroundColor: colors.backgroundSecondary }]}
          onPress={selectAll}
        >
          <View style={[styles.checkbox, selectedIds.size === filteredStudents.length && selectedIds.size > 0 && { backgroundColor: colors.primary }]}>
            {selectedIds.size === filteredStudents.length && selectedIds.size > 0 && (
              <ThemedText style={styles.checkmark}>✓</ThemedText>
            )}
          </View>
          <ThemedText style={styles.selectAllText}>Select All</ThemedText>
        </Pressable>

        {/* Students List */}
        {filteredStudents.map((student) => (
          <Pressable
            key={student.id}
            style={[styles.card, { 
              backgroundColor: colors.card,
              borderColor: colors.border,
            }]}
            onPress={() => toggleSelection(student.id)}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.checkbox, selectedIds.has(student.id) && { backgroundColor: colors.primary }]}>
                {selectedIds.has(student.id) && (
                  <ThemedText style={styles.checkmark}>✓</ThemedText>
                )}
              </View>
              <View style={styles.cardInfo}>
                <ThemedText style={styles.cardTitle}>{student.name}</ThemedText>
                <ThemedText style={styles.cardSubtitle}>{student.studentNumber}</ThemedText>
              </View>
              <View style={[styles.badge, { 
                backgroundColor: student.isActive ? colors.success : colors.danger 
              }]}>
                <ThemedText style={styles.badgeText}>
                  {student.isActive ? 'Active' : 'Inactive'}
                </ThemedText>
              </View>
            </View>
            <View style={styles.cardDetails}>
              <ThemedText style={styles.detailText}>📧 {student.email}</ThemedText>
              <ThemedText style={styles.detailText}>🏢 {student.department}</ThemedText>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    gap: 12,
  },
  searchInput: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    minWidth: 100,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonTextDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  selectAllText: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#8E8E93',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    opacity: 0.8,
  },
});

