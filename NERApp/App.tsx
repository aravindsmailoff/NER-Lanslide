import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { colors } from './src/theme/colors';
import { OfflineBar } from './src/components/OfflineBar';
import { LoginScreen } from './src/screens/LoginScreen';
import { EmergencyScreen } from './src/screens/EmergencyScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { AdvisoriesScreen } from './src/screens/AdvisoriesScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

type TabType = 'emergency' | 'dashboard' | 'advisories' | 'settings';

export default function App(): React.JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  // User Requirement: When user logs in, immediately land on emergency form
  const [activeTab, setActiveTab] = useState<TabType>('emergency');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    if (Platform.OS === 'android' && (StatusBar as any).setBackgroundColor) {
      (StatusBar as any).setBackgroundColor('#131315');
    }
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = (method: string) => {
    setIsLoggedIn(true);
    // Explicit requirement: Immediately display Emergency Card / Form after login
    setActiveTab('emergency');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('emergency');
  };

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLogin} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.brandSymbol}>🌐</Text>
          <View>
            <Text style={styles.brandTitle}>NER RiskWatch</Text>
            <Text style={styles.brandSub}>NORTHEAST COMMAND GRID</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.liveBadge}>
            <View style={styles.livePulse} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.clockText}>{currentTime}</Text>
        </View>
      </View>

      {/* Real-Time Offline / Online Status Bar */}
      <OfflineBar />

      {/* Active Screen Body */}
      <View style={styles.body}>
        {activeTab === 'emergency' && (
          <EmergencyScreen onSubmitted={() => setActiveTab('dashboard')} />
        )}
        {activeTab === 'dashboard' && (
          <DashboardScreen
            onNavigateToAdvisories={() => setActiveTab('advisories')}
            onNavigateToReport={() => setActiveTab('emergency')}
          />
        )}
        {activeTab === 'advisories' && (
          <AdvisoriesScreen onViewOnMap={() => setActiveTab('dashboard')} />
        )}
        {activeTab === 'settings' && <SettingsScreen onLogout={handleLogout} />}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'emergency' && styles.navItemActive]}
          activeOpacity={0.7}
          onPress={() => setActiveTab('emergency')}
        >
          <Text style={[styles.navIcon, activeTab === 'emergency' && styles.navIconActive]}>
            🚨
          </Text>
          <Text style={[styles.navLabel, activeTab === 'emergency' && styles.navLabelActive]}>
            REPORT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'dashboard' && styles.navItemActive]}
          activeOpacity={0.7}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.navIcon, activeTab === 'dashboard' && styles.navIconActive]}>
            🗺
          </Text>
          <Text style={[styles.navLabel, activeTab === 'dashboard' && styles.navLabelActive]}>
            MAP
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'advisories' && styles.navItemActive]}
          activeOpacity={0.7}
          onPress={() => setActiveTab('advisories')}
        >
          <Text style={[styles.navIcon, activeTab === 'advisories' && styles.navIconActive]}>
            🔔
          </Text>
          <Text style={[styles.navLabel, activeTab === 'advisories' && styles.navLabelActive]}>
            ALERTS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'settings' && styles.navItemActive]}
          activeOpacity={0.7}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={[styles.navIcon, activeTab === 'settings' && styles.navIconActive]}>
            ⚙
          </Text>
          <Text style={[styles.navLabel, activeTab === 'settings' && styles.navLabelActive]}>
            SETTINGS
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131315',
  },
  header: {
    height: 58,
    backgroundColor: 'rgba(19, 19, 21, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(69, 70, 77, 0.35)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 50,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandSymbol: {
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.2,
  },
  brandSub: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(31, 31, 33, 0.85)',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.riskCritical,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.riskCritical,
    letterSpacing: 0.8,
  },
  clockText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    fontVariant: ['tabular-nums'],
  },
  body: {
    flex: 1,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 84 : 72,
    backgroundColor: 'rgba(19, 19, 21, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(69, 70, 77, 0.3)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 16 : 6,
    zIndex: 50,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: 'rgba(62, 73, 93, 0.55)',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  navIconActive: {
    transform: [{ scale: 1.1 }],
  },
  navLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.8,
  },
  navLabelActive: {
    color: colors.primary,
  },
});
