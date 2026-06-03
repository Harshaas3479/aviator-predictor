# 📱 Aviator Predictor - Mobile App Setup Guide

## Quick Start

### 1. Prerequisites Installation

```bash
# Install Node.js (if not already installed)
# Download from https://nodejs.org/ (v16 or higher)

# Install Expo CLI globally
npm install -g expo-cli

# Verify installation
expo --version
```

### 2. Clone and Setup Project

```bash
# Navigate to project
cd aviator-predictor/mobile

# Install dependencies
npm install

# For iOS development (macOS only)
npm install -g eas-cli
```

### 3. Start Development Server

```bash
# Start Expo development server
npm start

# Alternative commands:
npm run ios       # Launch iOS simulator
npm run android   # Launch Android emulator
npm run web       # Launch in web browser
```

## Building for Production

### iOS Build

```bash
# Build for iOS
expo build:ios

# Or using EAS Build (recommended)
eas build --platform ios

# Install on device
# Scan QR code with Expo Go app on iOS device
```

### Android Build

```bash
# Build for Android APK
expo build:android

# Or using EAS Build
eas build --platform android

# The APK will be available for download
```

## App Structure

### Screens

#### 1. **Predictor Screen** (Main)
- Input round ID, multiplier, and historical data
- Get real-time analysis and predictions
- View risk assessment
- Display predicted multiplier range

#### 2. **History Screen**
- View all past predictions
- Filter and sort history
- View detailed analysis for each prediction
- Clear history option

#### 3. **Statistics Screen**
- Overall performance metrics
- Risk distribution charts
- Best/worst multiplier tracking
- Confidence and crash probability averages

#### 4. **Settings Screen**
- Configure notifications
- Toggle dark mode
- Export/backup data
- Reset app
- View app information

### Services

#### PredictorService
Core algorithm for:
- Statistical analysis (avg, std dev, variance)
- Trend detection
- Cycle detection
- Anomaly detection
- Crash probability calculation
- Risk assessment
- Confidence scoring

## Configuration

### Customize App Theme

Edit `src/App.tsx`:
```typescript
const Tab = createBottomTabNavigator();

// Customize colors
const COLORS = {
  primary: '#667eea',    // Main brand color
  success: '#4caf50',    // Low risk
  warning: '#ff9800',    // Medium risk
  danger: '#f44336',     // High risk
  background: '#f5f5f5', // Background
};
```

### Adjust Prediction Parameters

Edit `src/services/PredictorService.ts`:
```typescript
// Risk thresholds
if (variance > 100 || crashProb > 70) { // HIGH
if (variance > 50 || crashProb > 40)   // MEDIUM

// Trend multipliers
if (trend === 'uptrend') basePredict *= 1.15;    // +15%
if (trend === 'downtrend') basePredict *= 0.85;  // -15%

// Confidence calculation
let confidence = 50; // Base confidence
```

## Data Persistence

### AsyncStorage Keys

```
'aviatorHistory'           → All predictions
'lastPredictorSession'     → Last session data
```

### Export Format

Predictions are stored as:
```json
{
  "roundId": "ROUND_123",
  "multiplier": 2.45,
  "timestamp": "2026-06-03T10:30:00Z",
  "analysis": {
    "avg": 2.1,
    "max": 3.5,
    "min": 1.2,
    "stdDev": 0.8,
    "variance": 15.2,
    "trend": "uptrend",
    "riskLevel": "MEDIUM",
    "confidence": 75,
    "crashProbability": 45
  }
}
```

## API Integration (Future)

To add real-time Aviator game data:

```typescript
// In services/AviatorAPIService.ts
class AviatorAPIService {
  async fetchLiveData() {
    // Integration point for real-time multiplier data
  }
  
  async subscribeToUpdates(callback: (data: any) => void) {
    // WebSocket connection for live updates
  }
}
```

## Performance Tips

1. **Large Datasets**: Implement pagination for history
2. **Chart Optimization**: Limit visible data points (e.g., last 50)
3. **Memory Management**: Clear old cache periodically
4. **Network**: Cache API responses when online

## Testing

### Unit Tests

```bash
# Create test file: src/services/__tests__/PredictorService.test.ts

npm test
```

### Manual Testing Checklist

- [ ] Input validation works
- [ ] Calculations are accurate
- [ ] History persists after app restart
- [ ] Risk levels display correctly
- [ ] Charts render properly
- [ ] All screens navigate correctly
- [ ] Settings changes persist
- [ ] Export functionality works
- [ ] Reset clears all data
- [ ] App works offline

## Troubleshooting

### Common Issues

#### 1. "Module not found" error
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm start --clear
```

#### 2. AsyncStorage not working
```bash
# Check permissions in app.json
# Ensure @react-native-async-storage/async-storage is installed
npm install @react-native-async-storage/async-storage
```

#### 3. Charts not rendering
```bash
# Clear cache and rebuild
npm start --clear
# Reinstall chart library
npm install react-native-chart-kit@latest
```

#### 4. App freezes on large datasets
```typescript
// Implement pagination in HistoryScreen.tsx
const ITEMS_PER_PAGE = 20;
const [page, setPage] = useState(0);
const paginatedHistory = history.slice(
  page * ITEMS_PER_PAGE,
  (page + 1) * ITEMS_PER_PAGE
);
```

## Deployment Checklist

Before releasing to app stores:

- [ ] Update version number in `app.json`
- [ ] Add app icon (1024x1024 PNG)
- [ ] Add splash screen (2048x2048 PNG)
- [ ] Create privacy policy
- [ ] Write app description
- [ ] Set up analytics
- [ ] Configure error tracking
- [ ] Test on real devices (iOS + Android)
- [ ] Performance optimization
- [ ] Security review

## Release Process

### TestFlight (iOS)
```bash
eas build --platform ios
# Follow prompts to upload to TestFlight
```

### Google Play (Android)
```bash
eas build --platform android --release-channel production
# Download APK and sign
# Upload to Google Play Console
```

## Resources

- [React Native Docs](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [AsyncStorage API](https://react-native-async-storage.github.io/)

## Support & Feedback

- Report bugs: Create GitHub issue
- Feature requests: Discussions tab
- Contact: support@aviatorpredictor.com

---

Happy coding! 🚀
