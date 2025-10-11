import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  cardNumber: string;
  department: string;
  type: 'student' | 'staff';
  registeredDate: string;
}

// Mock data
const mockPendingUsers: PendingUser[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@university.edu', cardNumber: 'ST005', department: 'Computer Science', type: 'student', registeredDate: '2025-10-10' },
  { id: '2', name: 'Maria Garcia', email: 'maria@university.edu', cardNumber: 'SF005', department: 'Engineering', type: 'staff', registeredDate: '2025-10-09' },
  { id: '3', name: 'James Lee', email: 'james@university.edu', cardNumber: 'ST006', department: 'Business', type: 'student', registeredDate: '2025-10-08' },
  { id: '4', name: 'Dr. Patricia Martinez', email: 'patricia@university.edu', cardNumber: 'SF006', department: 'Medicine', type: 'staff', registeredDate: '2025-10-07' },
];

export default function ApprovalsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>(mockPendingUsers);
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
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const approveSelected = () => {
    if (selectedIds.size === 0) return;
    
    Alert.alert(
      'Approve Users',
      `Approve ${selectedIds.size} user(s)? They will be able to access their cards.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            setPendingUsers(pendingUsers.filter(u => !selectedIds.has(u.id)));
            setSelectedIds(new Set());
            Alert.alert('Success', `Approved ${selectedIds.size} user(s)`);
          }
        }
      ]
    );
  };

  const rejectSelected = () => {
    if (selectedIds.size === 0) return;
    
    Alert.alert(
      'Reject Users',
      `Reject ${selectedIds.size} user(s)? They will need to register again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            setPendingUsers(pendingUsers.filter(u => !selectedIds.has(u.id)));
            setSelectedIds(new Set());
            Alert.alert('Success', `Rejected ${selectedIds.size} user(s)`);
          }
        }
      ]
    );
  };

  const revokeAll = () => {
    Alert.alert(
      'Revoke All Users',
      'Are you sure you want to reject all pending registrations? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke All',
          style: 'destructive',
          onPress: () => {
            setPendingUsers([]);
            setSelectedIds(new Set());
            Alert.alert('Success', 'All pending users have been rejected');
          }
        }
      ]
    );
  };

  const filteredUsers = pendingUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.cardNumber.toLowerCase().includes(searchQuery.toLowerCase())
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
          placeholder="Search pending users..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.button, { backgroundColor: colors.secondary }]}
            onPress={approveSelected}
            disabled={selectedIds.size === 0}
          >
            <ThemedText style={[styles.buttonText, selectedIds.size === 0 && styles.buttonTextDisabled]}>
              ✓ Approve ({selectedIds.size})
            </ThemedText>
          </Pressable>
          
          <Pressable
            style={[styles.button, { backgroundColor: colors.warning }]}
            onPress={rejectSelected}
            disabled={selectedIds.size === 0}
          >
            <ThemedText style={[styles.buttonText, selectedIds.size === 0 && styles.buttonTextDisabled]}>
              ✕ Reject ({selectedIds.size})
            </ThemedText>
          </Pressable>
          
          <Pressable
            style={[styles.button, { backgroundColor: colors.danger }]}
            onPress={revokeAll}
            disabled={pendingUsers.length === 0}
          >
            <ThemedText style={[styles.buttonText, pendingUsers.length === 0 && styles.buttonTextDisabled]}>
              Revoke All
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {pendingUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyIcon}>✓</ThemedText>
            <ThemedText style={styles.emptyTitle}>No Pending Approvals</ThemedText>
            <ThemedText style={styles.emptyText}>
              All user registrations have been processed
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Select All */}
            <Pressable
              style={[styles.selectAllRow, { backgroundColor: colors.backgroundSecondary }]}
              onPress={selectAll}
            >
              <View style={[styles.checkbox, selectedIds.size === filteredUsers.length && selectedIds.size > 0 && { backgroundColor: colors.primary }]}>
                {selectedIds.size === filteredUsers.length && selectedIds.size > 0 && (
                  <ThemedText style={styles.checkmark}>✓</ThemedText>
                )}
              </View>
              <ThemedText style={styles.selectAllText}>Select All ({filteredUsers.length})</ThemedText>
            </Pressable>

            {/* Pending Users List */}
            {filteredUsers.map((user) => (
              <Pressable
                key={user.id}
                style={[styles.card, { 
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }]}
                onPress={() => toggleSelection(user.id)}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.checkbox, selectedIds.has(user.id) && { backgroundColor: colors.primary }]}>
                    {selectedIds.has(user.id) && (
                      <ThemedText style={styles.checkmark}>✓</ThemedText>
                    )}
                  </View>
                  <View style={styles.cardInfo}>
                    <ThemedText style={styles.cardTitle}>{user.name}</ThemedText>
                    <ThemedText style={styles.cardSubtitle}>{user.cardNumber}</ThemedText>
                  </View>
                  <View style={[styles.badge, { 
                    backgroundColor: user.type === 'student' ? colors.info : colors.warning 
                  }]}>
                    <ThemedText style={styles.badgeText}>
                      {user.type === 'student' ? 'Student' : 'Staff'}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.cardDetails}>
                  <ThemedText style={styles.detailText}>📧 {user.email}</ThemedText>
                  <ThemedText style={styles.detailText}>🏢 {user.department}</ThemedText>
                  <ThemedText style={styles.detailText}>📅 Registered: {user.registeredDate}</ThemedText>
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
  emptyState: {
    flex: 1,
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

