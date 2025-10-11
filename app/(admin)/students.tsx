import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useToast } from '@/components/Toast';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { User } from '@/models/User';
import { AdminService } from '@/services/adminService';
import { UserService } from '@/services/userService';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function StudentsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const toast = useToast();
  
  const [students, setStudents] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const users = await UserService.getUsersByRole('student');
      setStudents(users);
      if (!loading) {
        toast.success('Students list refreshed');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

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
      setSelectedIds(new Set(filteredStudents.map(s => s.uid)));
    }
  };

  const activateBulk = async () => {
    if (selectedIds.size === 0) {
      toast.warning('No students selected');
      return;
    }

    try {
      setRefreshing(true);
      toast.info(`Activating ${selectedIds.size} student(s)...`);
      const selectedCount = selectedIds.size;
      
      // Activate all selected students using AdminService
      const result = await AdminService.grantAccessBulk(Array.from(selectedIds));
      
      // Refresh list
      await fetchStudents();
      setSelectedIds(new Set());
      
      if (result.failed > 0) {
        toast.warning(`Activated ${result.success} student(s). ${result.failed} failed.`);
      } else {
        toast.success(`Activated ${selectedCount} student(s) successfully!`);
      }
    } catch (error) {
      console.error('Error activating students:', error);
      toast.error('Failed to activate students');
    } finally {
      setRefreshing(false);
    }
  };

  const revokeBulk = async () => {
    if (selectedIds.size === 0) {
      toast.warning('No students selected');
      return;
    }

    try {
      setRefreshing(true);
      toast.info(`Deactivating ${selectedIds.size} student(s)...`);
      const selectedCount = selectedIds.size;
      
      // Deactivate all selected students using AdminService
      const result = await AdminService.revokeAccessBulk(Array.from(selectedIds));
      
      // Refresh list
      await fetchStudents();
      setSelectedIds(new Set());
      
      if (result.failed > 0) {
        toast.warning(`Deactivated ${result.success} student(s). ${result.failed} failed.`);
      } else {
        toast.success(`Deactivated ${selectedCount} student(s) successfully!`);
      }
    } catch (error) {
      console.error('Error deactivating students:', error);
      toast.error('Failed to deactivate students');
    } finally {
      setRefreshing(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const fullName = `${s.FirstName} ${s.LastName}`.toLowerCase();
    const search = searchQuery.toLowerCase();
    return fullName.includes(search) ||
           s.email.toLowerCase().includes(search) ||
           s.cardNumber.toLowerCase().includes(search);
  });

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={{ marginTop: 16 }}>Loading students...</ThemedText>
      </ThemedView>
    );
  }

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
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.primary },
              pressed && styles.buttonPressed
            ]}
            onPress={() => router.push('/add-user?type=student')}
          >
            <ThemedText style={styles.buttonText}>+ Add Student</ThemedText>
          </Pressable>
          
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.secondary },
              pressed && styles.buttonPressed,
              (selectedIds.size === 0 || refreshing) && styles.buttonDisabled
            ]}
            onPress={activateBulk}
            disabled={selectedIds.size === 0 || refreshing}
          >
            <ThemedText style={[styles.buttonText, (selectedIds.size === 0 || refreshing) && styles.buttonTextDisabled]}>
              {refreshing ? '...' : `Activate (${selectedIds.size})`}
            </ThemedText>
          </Pressable>
          
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.danger },
              pressed && styles.buttonPressed,
              (selectedIds.size === 0 || refreshing) && styles.buttonDisabled
            ]}
            onPress={revokeBulk}
            disabled={selectedIds.size === 0 || refreshing}
          >
            <ThemedText style={[styles.buttonText, (selectedIds.size === 0 || refreshing) && styles.buttonTextDisabled]}>
              {refreshing ? '...' : `Revoke (${selectedIds.size})`}
            </ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.primary },
              pressed && styles.buttonPressed,
              refreshing && styles.buttonDisabled
            ]}
            onPress={fetchStudents}
            disabled={refreshing}
          >
            <ThemedText style={[styles.buttonText, refreshing && styles.buttonTextDisabled]}>
              🔄 Refresh
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {students.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyIcon}>👨‍🎓</ThemedText>
            <ThemedText style={styles.emptyTitle}>No Students</ThemedText>
            <ThemedText style={styles.emptyText}>
              No students registered yet
            </ThemedText>
          </View>
        ) : (
          <>
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
              <ThemedText style={styles.selectAllText}>Select All ({filteredStudents.length})</ThemedText>
            </Pressable>

            {/* Students List */}
            {filteredStudents.map((student) => (
              <Pressable
                key={student.uid}
                style={[styles.card, { 
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }]}
                onPress={() => toggleSelection(student.uid)}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.checkbox, selectedIds.has(student.uid) && { backgroundColor: colors.primary }]}>
                    {selectedIds.has(student.uid) && (
                      <ThemedText style={styles.checkmark}>✓</ThemedText>
                    )}
                  </View>
                  <View style={styles.cardInfo}>
                    <ThemedText style={styles.cardTitle}>
                      {student.FirstName} {student.LastName}
                    </ThemedText>
                    <ThemedText style={styles.cardSubtitle}>{student.cardNumber}</ThemedText>
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
                  <ThemedText style={styles.detailText}>
                    {student.isApproved ? '✓ Approved' : '⏳ Pending'}
                  </ThemedText>
                  {student.nfcId && (
                    <ThemedText style={styles.detailText}>🔑 NFC: {student.nfcId}</ThemedText>
                  )}
                </View>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
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
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
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

