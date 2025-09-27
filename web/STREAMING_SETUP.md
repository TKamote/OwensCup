# 🎥 OwensCup Tournament Streaming Setup Guide

## 📋 Overview

This guide will help you set up live streaming for your billiards tournament using:

- **Samsung S21** (primary camera)
- **iPhone 13 Mini** (backup camera)
- **MacBook Air** (streaming computer)
- **OBS Studio** (streaming software)

## 🎯 Streaming Platforms

- **Primary**: YouTube (best for billiards content)
- **Secondary**: Facebook (mobile-friendly)
- **Future**: X (Twitter) - progressive platform with better creator deals

## 🛠️ Hardware Setup

### 1. Camera Connection

```bash
# Samsung S21
USB-C to USB-C cable → MacBook Air

# iPhone 13 Mini (backup)
Lightning to USB-C cable → MacBook Air
```

### 2. Camera Positioning

- **Samsung S21**: Tripod-mounted, full table view
- **iPhone 13 Mini**: Handheld, close-up shots, player reactions

## 🎮 OBS Studio Setup

### 1. Download OBS Studio

- Visit: https://obsproject.com/
- Download for macOS
- Install and open

### 2. Create Scenes

```
Scenes to create:
├── "TV Display" (Full tournament view)
├── "Stream Overlay" (Compact sidebar)
├── "Camera Feed" (Samsung S21)
├── "Picture-in-Picture" (Camera + Overlay)
└── "Split View" (Multiple angles)
```

### 3. Add Sources

- **Browser Source**: Web app (TV Display/Stream Overlay)
- **Video Capture Device**: Samsung S21
- **Audio Input**: Camera audio or external mic

### 4. Scene Transitions

- Set up hotkeys for quick scene switching
- Smooth transitions between camera and overlay
- Picture-in-picture for simultaneous views

## 📱 Web App Integration

### 1. Browser Source Setup

- **URL**: `http://localhost:3000` (TV Display)
- **URL**: `http://localhost:3000/stream` (Stream Overlay)
- **Width**: 1920px
- **Height**: 1080px
- **FPS**: 30fps

### 2. Real-time Updates

- Firebase syncs match scores automatically
- No manual updates needed during streaming
- Live score updates appear instantly

## 🎬 Streaming Workflow

### 1. Pre-Stream Setup

1. Connect Samsung S21 to MacBook Air
2. Open OBS Studio
3. Open web app in browser
4. Test all scenes and transitions
5. Set up streaming platform (YouTube/Facebook)

### 2. During Stream

1. **Start with TV Display** - show full tournament
2. **Switch to Camera Feed** - show billiards action
3. **Use Stream Overlay** - compact view for online viewers
4. **Picture-in-Picture** - camera + scores simultaneously
5. **Switch scenes** based on match excitement

### 3. Scene Selection Strategy

- **TV Display**: Between matches, showing overall progress
- **Camera Feed**: During active gameplay
- **Stream Overlay**: When you want to show scores while playing
- **Picture-in-Picture**: Best of both worlds

## 🎯 Content Strategy

### 1. Dynamic Switching

- **Switch scenes** based on which table has interesting action
- **Show scores** when matches are close
- **Camera focus** on exciting shots and player reactions
- **Tournament overview** during breaks

### 2. Engagement

- **Real-time scores** keep viewers engaged
- **Multiple angles** prevent boredom
- **Professional overlay** looks polished
- **Live updates** create urgency

## 🔧 Technical Settings

### 1. Video Settings

- **Resolution**: 1920x1080 (1080p)
- **Frame Rate**: 30fps
- **Bitrate**: 2500-4000 kbps
- **Encoder**: Hardware (if available)

### 2. Audio Settings

- **Sample Rate**: 44.1kHz
- **Bitrate**: 128kbps
- **Channels**: Stereo

### 3. Network Requirements

- **Upload Speed**: Minimum 5 Mbps
- **Recommended**: 10+ Mbps
- **Stable connection** essential

## 🚀 Getting Started

### 1. Test Setup

1. Connect Samsung S21
2. Open OBS Studio
3. Add web app as Browser Source
4. Add camera as Video Capture Device
5. Test scene switching
6. Do a test stream

### 2. First Live Stream

1. Set up YouTube/Facebook streaming
2. Start with TV Display scene
3. Switch to camera when matches begin
4. Use overlay for score updates
5. Engage with chat if available

## 📊 Monitoring

### 1. Stream Health

- Monitor OBS for dropped frames
- Check audio levels
- Ensure stable internet connection
- Watch for overheating

### 2. Viewer Engagement

- Respond to chat messages
- Explain tournament format
- Highlight exciting moments
- Share match statistics

## 🎉 Success Tips

1. **Practice scene switching** before going live
2. **Test everything** with a short stream first
3. **Have backup plans** (iPhone as secondary camera)
4. **Engage with viewers** in chat
5. **Keep content dynamic** - switch scenes frequently
6. **Show personality** - explain what's happening
7. **Highlight exciting moments** - close matches, great shots

## 🔄 Future Enhancements

### 1. Advanced Features

- **Multiple camera angles** (add more phones)
- **Replay system** for great shots
- **Player statistics** overlay
- **Tournament bracket** visualization

### 2. Monetization

- **YouTube monetization** (1000+ subscribers)
- **Facebook Creator Fund**
- **X (Twitter) creator incentives**
- **Sponsorship opportunities**

## 🆘 Troubleshooting

### Common Issues:

1. **Camera not detected**: Check USB connection, restart OBS
2. **Poor video quality**: Adjust bitrate, check internet speed
3. **Audio issues**: Check audio input settings
4. **Web app not updating**: Refresh browser source in OBS
5. **Stream drops**: Check internet stability

### Support:

- OBS documentation: https://obsproject.com/help
- YouTube Creator Academy: https://creatoracademy.youtube.com/
- Facebook Live best practices: https://www.facebook.com/business/help/

---

**Ready to stream?** Start with a test stream, then go live with your first tournament! 🎱📺
