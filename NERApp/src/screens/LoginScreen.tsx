import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  onLoginSuccess: (method: string) => void;
}

export const LoginScreen: React.FC<Props> = ({ onLoginSuccess }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Ambient Grid overlay */}
      <View style={styles.gridOverlay} />

      <View style={styles.content}>
        {/* Shield Icon Header */}
        <View style={styles.iconCircle}>
          <Text style={styles.shieldSymbol}>🛡</Text>
        </View>

        <View style={styles.badgeRow}>
          <Text style={styles.hubDot}>◆</Text>
          <Text style={styles.badgeText}>NER RISKWATCH // CRISIS GRID</Text>
        </View>

        <Text style={styles.title}>Secure Access</Text>
        <Text style={styles.subtitle}>
          Verify your identity to enable emergency reporting, offline protection, and rapid response coordination.
        </Text>

        {/* Login Box */}
        <View style={styles.card}>
          <View style={styles.cardHeaderAccent} />

          {/* DigiLocker Button */}
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.8}
            onPress={() => onLoginSuccess('DigiLocker')}
          >
            <Text style={styles.btnIcon}>🔒</Text>
            <Text style={styles.primaryBtnText}>Continue with DigiLocker</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In */}
          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.8}
            onPress={() => onLoginSuccess('Google')}
          >
            <Text style={styles.btnIcon}>👤</Text>
            <Text style={styles.secondaryBtnText}>Sign in with Google</Text>
          </TouchableOpacity>

          {/* Direct Offline Emergency Bypass */}
          <TouchableOpacity
            style={styles.emergencyBypassBtn}
            activeOpacity={0.8}
            onPress={() => onLoginSuccess('Emergency Bypass')}
          >
            <Text style={styles.emergencyBypassText}>⚡ QUICK EMERGENCY REPORTING (OFFLINE)</Text>
          </TouchableOpacity>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>ⓘ</Text>
            <Text style={styles.infoText}>
              Required for automated location-based dispatches to NDRF and state disaster authorities.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerContact}>Emergency Helpline: 112 / 1070</Text>
        <Text style={styles.footerGov}>GOVERNMENT OF NER · DISASTER MONITORING v2.4</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131315',
    justifyContent: 'space-between',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(19, 19, 21, 0.95)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 77, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#bec6e0',
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  shieldSymbol: {
    fontSize: 34,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  hubDot: {
    color: colors.primary,
    fontSize: 10,
  },
  badgeText: {
    color: colors.onSurfaceVariant,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
    marginBottom: 28,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(31, 31, 33, 0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 77, 0.5)',
    padding: 22,
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeaderAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 4,
  },
  btnIcon: {
    fontSize: 16,
  },
  primaryBtnText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(69, 70, 77, 0.4)',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(69, 70, 77, 0.6)',
    borderRadius: 999,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  secondaryBtnText: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
  emergencyBypassBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 999,
    paddingVertical: 11,
    alignItems: 'center',
    marginBottom: 16,
  },
  emergencyBypassText: {
    color: '#ffb4ab',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 4,
  },
  infoIcon: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: 'rgba(198, 198, 205, 0.75)',
    lineHeight: 16,
  },
  footer: {
    paddingVertical: 18,
    alignItems: 'center',
    gap: 4,
  },
  footerContact: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  footerGov: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(198, 198, 205, 0.4)',
    letterSpacing: 1,
  },
});
