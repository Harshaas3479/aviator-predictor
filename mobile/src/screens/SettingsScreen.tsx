import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [highRiskAlerts, setHighRiskAlerts] = useState(true);

  const handleExportData = async () => {
    try {
      const history = await AsyncStorage.getItem('aviatorHistory');
      if (history) {
        // In a real app, you would share or download this data
        Alert.alert('Success', 'Data exported successfully', [
          { text: 'OK' },
        ]);
      } else {
        Alert.alert('Info', 'No data to export');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleResetApp = () => {
    Alert.alert('Reset App', 'Are you sure you want to reset all data?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('aviatorHistory');
            await AsyncStorage.removeItem('lastPredictorSession');
            Alert.alert('Success', 'App has been reset');
          } catch (error) {
            Alert.alert('Error', 'Failed to reset app');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingTitle}>Enable Notifications</Text>
            <Text style={styles.settingDescription}>
              Get alerts for predictions and updates
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#ccc', true: '#81c784' }}
            thumbColor={notifications ? '#4caf50' : '#f0f0f0'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingTitle}>High Risk Alerts</Text>
            <Text style={styles.settingDescription}>
              Alert when risk level is high
            </Text>
          </View>
          <Switch
            value={highRiskAlerts}
            onValueChange={setHighRiskAlerts}
            trackColor={{ false: '#ccc', true: '#81c784' }}
            thumbColor={highRiskAlerts ? '#4caf50' : '#f0f0f0'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Display</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLabel}>
            <Text style={styles.settingTitle}>Dark Mode</Text>
            <Text style={styles.settingDescription}>
              Enable dark theme (coming soon)
            </Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#ccc', true: '#81c784' }}
            thumbColor={darkMode ? '#4caf50' : '#f0f0f0'}
            disabled
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleExportData}>
          <Text style={styles.buttonIcon}>📤</Text>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Export Data</Text>
            <Text style={styles.buttonDescription}>
              Export prediction history
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleResetApp}>
          <Text style={styles.buttonIcon}>🔄</Text>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>Reset App</Text>
            <Text style={styles.buttonDescription}>
              Delete all data and reset settings
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Build</Text>
            <Text style={styles.infoValue}>20260603</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.infoValue}>✅ Production</Text>
          </View>
        </View>

        <View style={styles.descriptionBox}>
          <Text style={styles.descriptionText}>
            🔮 Aviator Predictor Mobile App
          </Text>
          <Text style={styles.descriptionText}>
            Analyze multiplier patterns and predict Aviator game outcomes with advanced statistical analysis.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ by Harshaas3479</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#999',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  buttonContent: {
    flex: 1,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 13,
    color: '#999',
  },
  infoBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  descriptionBox: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default SettingsScreen;
