import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { colors } from '../theme/colors';
import { OfflineStore, EmergencyReport, DEFAULT_SERVER_URL } from '../database/offlineStore';

interface Props {
  onLogout: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ onLogout }) => {
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [broadcasts, setBroadcasts] = useState(true);
  const [locationTracking, setLocationTracking] = useState(false);
  const [reports, setReports] = useState<EmergencyReport[]>([]);
  const [serverUrl, setServerUrl] = useState<string>(DEFAULT_SERVER_URL);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<string>('');

  const loadReports = async () => {
    const list = await OfflineStore.getReports();
    setReports(list);
    const url = await OfflineStore.getServerUrl();
    setServerUrl(url);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleManualSync = async () => {
    const res = await OfflineStore.syncAllPending();
    await loadReports();
    Alert.alert('Sync Complete', `Successfully dispatched ${res.syncedCount} queued reports to NER Command.`);
  };

  const handleClear = () => {
    Alert.alert(
      'Clear Stored Records?',
      'This will delete locally cached offline reports.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await OfflineStore.clearAll();
            await loadReports();
          },
        },
      ]
    );
  };

  const pendingCount = reports.filter(r => r.status === 'PENDING_OFFLINE').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Officer Profile */}
      <View style={styles.panel}>
        <View style={styles.profileRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>👮</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Duty Officer</Text>
            <Text style={styles.profileRole}>NER COMMAND · SECTOR 7</Text>
            <Text style={styles.profileMeta}>Vigilant v2.4 · Native Standalone Session</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Offline Database Manager */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>OFFLINE STORAGE ENGINE</Text>
        <View style={styles.statLine}>
          <Text style={styles.statLabel}>Total Offline Records:</Text>
          <Text style={styles.statVal}>{reports.length}</Text>
        </View>
        <View style={styles.statLine}>
          <Text style={styles.statLabel}>Pending Cloud Dispatch:</Text>
          <Text style={[styles.statVal, { color: pendingCount > 0 ? colors.riskCritical : colors.riskLow }]}>
            {pendingCount}
          </Text>
        </View>

        <View style={styles.dbActionsRow}>
          <TouchableOpacity
            style={styles.syncBtn}
            activeOpacity={0.8}
            onPress={handleManualSync}
          >
            <Text style={styles.syncBtnText}>⚡ Force Sync Pending</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.clearBtn}
            activeOpacity={0.8}
            onPress={handleClear}
          >
            <Text style={styles.clearBtnText}>Clear Cache</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Command Center Server Connection */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>COMMAND CENTER SYNC GATEWAY</Text>
        <Text style={styles.panelDesc}>
          Direct dispatch endpoint for real-time mission radar synchronization.
        </Text>
        <View style={styles.urlInputContainer}>
          <TextInput
            style={styles.urlInput}
            value={serverUrl}
            onChangeText={setServerUrl}
            placeholder="http://10.0.2.2:3000/api"
            placeholderTextColor="#909097"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.saveUrlBtn}
            onPress={async () => {
              await OfflineStore.setServerUrl(serverUrl);
              Alert.alert('Saved', 'Command Center endpoint updated.');
            }}
          >
            <Text style={styles.saveUrlBtnText}>Save</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.pingBtn, isPinging && { opacity: 0.6 }]}
          disabled={isPinging}
          onPress={async () => {
            setIsPinging(true);
            const res = await OfflineStore.pingServer();
            setIsPinging(false);
            setPingResult(res.message || (res.success ? 'Connected' : 'Failed'));
            Alert.alert(
              res.success ? '✓ Server Reachable' : '✗ Server Unreachable',
              `Target: ${serverUrl}\nStatus: ${res.message}`
            );
          }}
        >
          <Text style={styles.pingBtnText}>
            {isPinging ? 'TESTING LATENCY...' : '⚡ TEST COMMAND CENTER PING'}
          </Text>
        </TouchableOpacity>
        {pingResult ? (
          <Text style={styles.pingResultText}>Gateway Status: {pingResult}</Text>
        ) : null}
      </View>

      {/* Emergency Notifications */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>EMERGENCY PROTOCOLS</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>High-Urgency Flash SOS</Text>
          <Switch
            value={criticalAlerts}
            onValueChange={setCriticalAlerts}
            thumbColor={criticalAlerts ? colors.primary : '#909097'}
            trackColor={{ false: '#353436', true: colors.secondaryContainer }}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Advisory Broadcasts</Text>
          <Switch
            value={broadcasts}
            onValueChange={setBroadcasts}
            thumbColor={broadcasts ? colors.primary : '#909097'}
            trackColor={{ false: '#353436', true: colors.secondaryContainer }}
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Background GPS Tracking</Text>
          <Switch
            value={locationTracking}
            onValueChange={setLocationTracking}
            thumbColor={locationTracking ? colors.primary : '#909097'}
            trackColor={{ false: '#353436', true: colors.secondaryContainer }}
          />
        </View>
      </View>

      {/* System Diagnostics */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>SYSTEM DIAGNOSTICS</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Runtime</Text>
          <Text style={styles.infoVal}>React Native 0.87 (Native Bare)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Engine</Text>
          <Text style={styles.infoVal}>Hermes Bytecode Engine</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Package ID</Text>
          <Text style={styles.infoVal}>org.ner.riskwatch</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoKey}>Regional Grid</Text>
          <Text style={styles.infoVal}>NE-INDIA-01 (Guwahati Node)</Text>
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        style={styles.signoutBtn}
        activeOpacity={0.8}
        onPress={onLogout}
      >
        <Text style={styles.signoutBtnText}>SIGN OUT SESSION</Text>
      </TouchableOpacity>

      <Text style={styles.legalNotice}>
        GOVERNMENT OF NER · RISKWATCH RESCUE & FIELD RESPONSE
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131315',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  panel: {
    backgroundColor: 'rgba(31, 31, 33, 0.85)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 77, 0.45)',
    padding: 16,
    marginBottom: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#353436',
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 77, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e4e2e4',
  },
  profileRole: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
    marginTop: 2,
  },
  profileMeta: {
    fontSize: 10,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  logoutBtn: {
    padding: 8,
  },
  logoutIcon: {
    fontSize: 20,
  },
  panelTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 12,
  },
  statLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e4e2e4',
  },
  dbActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  syncBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  syncBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  clearBtn: {
    backgroundColor: 'rgba(53, 52, 54, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 77, 0.6)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 13,
    color: '#e4e2e4',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  infoKey: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  infoVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#e4e2e4',
  },
  signoutBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255, 180, 171, 0.45)',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 8,
  },
  signoutBtnText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  panelDesc: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginBottom: 10,
    lineHeight: 16,
  },
  urlInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  urlInput: {
    flex: 1,
    backgroundColor: '#1b1b1d',
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 77, 0.6)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#e4e2e4',
    fontSize: 13,
  },
  saveUrlBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveUrlBtnText: {
    color: colors.onPrimary,
    fontWeight: '700',
    fontSize: 12,
  },
  pingBtn: {
    backgroundColor: 'rgba(190, 198, 224, 0.12)',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  pingBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pingResultText: {
    fontSize: 11,
    color: colors.riskLow,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  legalNotice: {
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(198, 198, 205, 0.3)',
    letterSpacing: 0.8,
    marginTop: 8,
  },
});
