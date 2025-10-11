import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { User } from '@/models/User';
import { UserService } from '@/services/userService';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function StaffStudentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  
  const [students, setStudents] = useState<User[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch students from staff's department
  const fetchDepartmentStudents = async () => {
    try {
      setLoading(true);
      // Get all students
      const allStudents = await UserService.getUsersByRole('student');
      // Filter by department
      const departmentStudents = allStudents.filter(s => s.department === user?.department);
      setStudents(departmentStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.department) {
      fetchDepartmentStudents();
    }
  }, [user?.department]);

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

  const approveStudents = async () => {
    if (selectedIds.size === 0) return;

    Alert.alert(
      'Approve Students',
      `Approve ${selectedIds.size} student(s)? They will be able to access the system.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              setRefreshing(true);
              const selectedCount = selectedIds.size;
              
              // Approve all selected students
              const promises = Array.from(selectedIds).map(uid => 
                UserService.approveUser(uid)
              );
              
              await Promise.all(promises);
              
              // Refresh list
              await fetchDepartmentStudents();
              setSelectedIds(new Set());
              
              Alert.alert('Success', `Approved ${selectedCount} student(s)`);
            } catch (error) {
              console.error('Error approving students:', error);
              Alert.alert('Error', 'Failed to approve some students');
            }
          }
        }
      ]
    );
  };

  const activateBulk = async () => {
    if (selectedIds.size === 0) return;

    Alert.alert(
      'Activate Students',
      `Activate ${selectedIds.size} student(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          onPress: async () => {
            try {
              setRefreshing(true);
              const selectedCount = selectedIds.size;
              
              // Activate all selected students
              const promises = Array.from(selectedIds).map(uid => 
                UserService.updateUser(uid, { isActive: true })
              );
              
              await Promise.all(promises);
              
              // Refresh list
              await fetchDepartmentStudents();
              setSelectedIds(new Set());
              
              Alert.alert('Success', `Activated ${selectedCount} student(s)`);
            } catch (error) {
              console.error('Error activating students:', error);
              Alert.alert('Error', 'Failed to activate some students');
            }
          }
        }
      ]
    );
  };

  const revokeBulk = async () => {
    if (selectedIds.size === 0) return;

    Alert.alert(
      'Deactivate Students',
      `Deactivate ${selectedIds.size} student(s)? They will lose access to the system.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              setRefreshing(true);
              const selectedCount = selectedIds.size;
              
              // Deactivate all selected students
              const promises = Array.from(selectedIds).map(uid => 
                UserService.deactivateUser(uid)
              );
              
              await Promise.all(promises);
              
              // Refresh list
              await fetchDepartmentStudents();
              setSelectedIds(new Set());
              
              Alert.alert('Success', `Deactivated ${selectedCount} student(s)`);
            } catch (error) {
              console.error('Error deactivating students:', error);
              Alert.alert('Error', 'Failed to deactivate some students');
            }
          }
        }
      ]
    );
  };

  const filteredStudents = students.filter(s => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const search = searchQuery.toLowerCase();
    return fullName.includes(search) ||
           s.email.toLowerCase().includes(search) ||
           s.cardNumber.toLowerCase().includes(search);
  });

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.secondary} />
        <ThemedText style={{ marginTop: 16 }}>Loading students...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Department Info Banner */}
      <View style={[styles.banner, { backgroundColor: `${colors.secondary}15`, borderColor: colors.secondary }]}>
        <ThemedText style={styles.bannerIcon}>🏢</ThemedText>
        <View style={styles.bannerInfo}>
          <ThemedText style={styles.bannerTitle}>Your Department</ThemedText>
          <ThemedText style={[styles.bannerDepartment, { color: colors.secondary }]}>
            {user?.department || 'N/A'}
          </ThemedText>
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
            style={[styles.button, { backgroundColor: colors.info }]}
            onPress={approveStudents}
            disabled={selectedIds.size === 0 || refreshing}
          >
            <ThemedText style={[styles.buttonText, (selectedIds.size === 0 || refreshing) && styles.buttonTextDisabled]}>
              {refreshing ? '...' : `✓ Approve (${selectedIds.size})`}
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.button, { backgroundColor: colors.success }]}
            onPress={activateBulk}
            disabled={selectedIds.size === 0 || refreshing}
          >
            <ThemedText style={[styles.buttonText, (selectedIds.size === 0 || refreshing) && styles.buttonTextDisabled]}>
              {refreshing ? '...' : `Activate (${selectedIds.size})`}
            </ThemedText>
          </Pressable>
          
          <Pressable
            style={[styles.button, { backgroundColor: colors.danger }]}
            onPress={revokeBulk}
            disabled={selectedIds.size === 0 || refreshing}
          >
            <ThemedText style={[styles.buttonText, (selectedIds.size === 0 || refreshing) && styles.buttonTextDisabled]}>
              {refreshing ? '...' : `Revoke (${selectedIds.size})`}
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.button, { backgroundColor: colors.secondary }]}
            onPress={fetchDepartmentStudents}
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
              No students in your department yet
            </ThemedText>
          </View>
        ) : (
          <>
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
                key={student.uid}
                style={[styles.card, { 
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }]}
                onPress={() => toggleSelection(student.uid)}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.checkbox, selectedIds.has(student.uid) && { backgroundColor: colors.secondary }]}>
                    {selectedIds.has(student.uid) && (
                      <ThemedText style={styles.checkmark}>✓</ThemedText>
                    )}
                  </View>
                  <View style={styles.cardInfo}>
                    <ThemedText style={styles.cardTitle}>
                      {student.firstName} {student.lastName}
                    </ThemedText>
                    <ThemedText style={styles.cardSubtitle}>{student.cardNumber}</ThemedText>
                  </View>
                  <View style={styles.badgeContainer}>
                    {!student.isApproved && (
                      <View style={[styles.badge, { backgroundColor: colors.warning }]}>
                        <ThemedText style={styles.badgeText}>Pending</ThemedText>
                      </View>
                    )}
                    <View style={[styles.badge, { 
                      backgroundColor: student.isActive ? colors.success : colors.danger 
                    }]}>
                      <ThemedText style={styles.badgeText}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </ThemedText>
                    </View>
                  </View>
                </View>
                <View style={styles.cardDetails}>
                  <ThemedText style={styles.detailText}>📧 {student.email}</ThemedText>
                  <ThemedText style={styles.detailText}>
                    {student.nfcId ? `🔑 NFC: ${student.nfcId}` : '⚠️ No NFC card assigned'}
                  </ThemedText>
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

