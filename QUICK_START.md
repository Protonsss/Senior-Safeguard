# 🚀 Quick Start Guide - The Guardian System

## Get Started in 5 Minutes

### 1. Install Dependencies (Already Done! ✅)

The Three.js dependencies have been installed:
```bash
✅ three@0.160.0
✅ @react-three/fiber@8.15.0
✅ @react-three/drei@9.92.0
```

### 2. Start the Development Server

```bash
npm run dev
```

### 3. View The Guardian System

Open your browser and navigate to:

#### 🔮 **Main Guardian Dashboard** (The Orb!)
```
http://localhost:3000/guardian
```

This is the **centerpiece** - the living, breathing Guardian Orb with:
- 3D animated sphere with 300 orbiting particles
- Six emotional states (Idle → Listening → Thinking → Responding → Alert → Critical)
- Four corner status cards (Camera, Vitals, Voice, Safety)
- Enterprise navigation bar
- Emergency test buttons at the bottom

#### 👥 **Senior Management Interface**
```
http://localhost:3000/guardian/seniors
```

This is the **practical system** for managing seniors:
- Real-time senior list with Supabase integration
- Search and filter functionality
- Call, SMS, and Scam Shield controls
- Status monitoring (Online/Offline/Alert)
- Battery, location, and activity tracking

### 4. Test The Guardian Orb States

The orb automatically cycles through states every 8 seconds for demo purposes.

You can also manually trigger states using the buttons at the bottom:
- **"Test Alert"** → Amber orb, urgent pulse, warning rings
- **"Test Emergency"** → RED orb, fast strobe, full-screen takeover
- **"Reset to Idle"** → Return to calm watchful state

### 5. Manage Seniors

Navigate to `/guardian/seniors` and:
- View all seniors in a grid layout
- Search by name or phone number
- Filter by status (Online/Offline/Alert)
- Call, SMS, or toggle Scam Shield for each senior

## 🎉 You're Ready!

The Guardian system is now running. Read GUARDIAN_SYSTEM.md for complete documentation.

**"Build it like your grandmother's life depends on it. Because someone's does."**
