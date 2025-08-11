# Recording Time Limits

## Overview
The recording functionality now includes a maximum recording duration of 15 minutes (900 seconds) to ensure optimal performance and prevent excessively long recordings.

## Features

### Maximum Recording Duration
- **Limit**: 15 minutes (900 seconds) of active recording time
- **Automatic Stop**: Recording automatically stops when the limit is reached
- **Immediate Processing**: Audio is immediately uploaded and processed when auto-stopped

### User Interface
- **Countdown Timer**: Shows remaining time in MM:SS format (counts down from 15:00 to 0:00)
- **Warning System**: Shows warning when 1 minute remains
- **Visual Alerts**: Timer turns red and pulses when under 1 minute remaining

### Pause Behavior
- **Paused Time Excluded**: Time spent paused does not count toward the 15-minute limit
- **Accurate Tracking**: Only active recording time is counted
- **Seamless Resume**: Users can pause and resume without losing progress

### Configuration
The recording limit is configurable in the code:

```typescript
// In components/recording-widget.tsx
const MAX_RECORDING_TIME = 900; // 15 minutes in seconds
const WARNING_TIME = 60; // Show warning when 1 minute left
```

## Implementation Details

### AudioRecorder Class Updates
- Added timing tracking for active recording duration
- Separate tracking of paused time vs active recording time
- New method: `getActiveRecordingDuration()` returns seconds of active recording

### Recording Widget Updates
- Real-time timer updates based on active recording time
- Automatic stop when limit reached
- Visual warnings and progress indicators
- Toast notifications for warnings and auto-stop

### User Experience
1. **Normal Recording**: Users see countdown timer starting at 15:00 and counting down to 0:00
2. **Warning Phase**: When 1 minute remains, timer turns red and shows warning toast
3. **Auto-Stop**: When timer reaches 0:00, recording stops automatically with notification
4. **Processing**: Audio immediately begins upload and transcription process

## Benefits
- **Prevents Long Recordings**: Avoids performance issues with extremely long audio files
- **Better UX**: Clear feedback about recording limits and remaining time
- **Reliable Processing**: Ensures audio files stay within optimal processing limits
- **Configurable**: Easy to adjust limits in the future if needed

## No Breaking Changes
- All existing functionality remains intact
- Pause, resume, and cancel features work as before
- Same upload and transcription pipeline
- No changes to backend endpoints