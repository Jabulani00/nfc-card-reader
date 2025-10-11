import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

interface Student {
  id: string;
  name: string;
  email: string;
  studentNumber: string;
  department: string;
  isActive: boolean;
  hasAccessCard: boolean;
}

// Mock data - Staff can only see their department's students
const STAFF_DEPARTMENT = 'Computer Science'; // This would come from auth/context

const mockStudents: Student[] = [
  { id: '1', name: 'John Doe', email: 'john@university.edu', studentNumber: 'ST001', department: 'Computer Science', isActive: false, hasAccessCard: true },
  { id: '2', name: 'Jane Smith', email: 'jane@university.edu', studentNumber: 'ST002', department: 'Computer Science', isActive: true, hasAccessCard: true },
  { id: '5', name: 'Alex Brown', email: 'alex@university.edu', studentNumber: 'ST005', department: 'Computer Science', isActive: false, hasAccessCard: false },
  { id: '6', name: 'Emma Wilson', email: 'emma@university.edu', studentNumber: 'ST006', department: 'Computer Science', isActive: true, hasAccessCard: true },
];

export default function StaffStudentsScreen() {
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

  const grantAccessBulk = () => {
    const studentsToGrant = students.filter(s => 
      selectedIds.has(s.id) && s.hasAccessCard && !s.isActive
    );
    
    if (studentsToGrant.length === 0) {
      Alert.alert('Info', 'No eligible students selected. Students must have registered access cards.');
      return;
    }

    setStudents(students.map(s => 
      selectedIds.has(s.id) && s.hasAccessCard ? { ...s, isActive: true } : s
    ));
    setSelectedIds(new Set());
    Alert.alert('Success', `Granted access to ${studentsToGrant.length} student(s)`);
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
      {/* Department Info Banner */}
      <View style={[styles.banner, { backgroundColor: `${colors.secondary}15`, borderColor: colors.secondary }]}>
        <ThemedText style={styles.bannerIcon}>🏢</ThemedText>
        <View style={styles.bannerInfo}>
          <ThemedText style={styles.bannerTitle}>Your Department</ThemedText>
          <ThemedText style={[styles.bannerDepartment, { color: colors.secondary }]}>{STAFF_DEPARTMENT}</ThemedText>
        </View>
        <View style={[styles.countBadge, { backgroundColor: colors.secondary }]}>
          <ThemedText style={styles.countBadgeText}>{students.length}</ThemedText>
        </View>
      </View>

      {/* Header Actions */}
      <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
        <TextInput
          style={[styles.searchInput, { 
            backgroundColor: colors.background,
            color: colors.text,
            borderColor: colors.border,
          }]}
          placeholder="Search students in your department..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.button, { backgroundColor: colors.success }]}
            onPress={grantAccessBulk}
            disabled={selectedIds.size === 0}
          >
            <ThemedText style={[styles.buttonText, selectedIds.size === 0 && styles.buttonTextDisabled]}>
              ✓ Grant Access ({selectedIds.size})
            </ThemedText>
          </Pressable>
          
          <Pressable
            style={[styles.button, { backgroundColor: colors.danger }]}
            onPress={revokeBulk}
            disabled={selectedIds.size === 0}
          >
            <ThemedText style={[styles.buttonText, selectedIds.size === 0 && styles.buttonTextDisabled]}>
              ✕ Revoke ({selectedIds.size})
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
          <View style={[styles.checkbox, selectedIds.size === filteredStudents.length && selectedIds.size > 0 && { backgroundColor: colors.secondary }]}>
            {selectedIds.size === filteredStudents.length && selectedIds.size > 0 && (
              <ThemedText style={styles.checkmark}>✓</ThemedText>
            )}
          </View>
          <ThemedText style={styles.selectAllText}>Select All ({filteredStudents.length})</ThemedText>
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
              <View style={[styles.checkbox, selectedIds.has(student.id) && { backgroundColor: colors.secondary }]}>
                {selectedIds.has(student.id) && (
                  <ThemedText style={styles.checkmark}>✓</ThemedText>
                )}
              </View>
              <View style={styles.cardInfo}>
                <ThemedText style={styles.cardTitle}>{student.name}</ThemedText>
                <ThemedText style={styles.cardSubtitle}>{student.studentNumber}</ThemedText>
              </View>
              <View style={styles.badgeContainer}>
                {student.hasAccessCard ? (
                  <View style={[styles.badge, { 
                    backgroundColor: student.isActive ? colors.success : colors.warning 
                  }]}>
                    <ThemedText style={styles.badgeText}>
                      {student.isActive ? 'Active' : 'Pending'}
                    </ThemedText>
                  </View>
                ) : (
                  <View style={[styles.badge, { backgroundColor: colors.textTertiary }]}>
                    <ThemedText style={styles.badgeText}>No Card</ThemedText>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.cardDetails}>
              <ThemedText style={styles.detailText}>📧 {student.email}</ThemedText>
              <ThemedText style={styles.detailText}>
                {student.hasAccessCard ? '💳 Access card registered' : '⚠️ No access card registered'}
              </ThemedText>
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 2,
    gap: 12,
  },
  bannerIcon: {
    fontSize: 32,
  },
  bannerInfo: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 12,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bannerDepartment: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  countBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
    minWidth: 140,
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
  badgeContainer: {
    flexDirection: 'row',
    gap: 6,
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

