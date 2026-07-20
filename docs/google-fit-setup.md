# Google Fit Integration Guide

## Overview

Connect your wearables (Noise, Fitbit, Samsung, Wear OS, etc.) to AI Arogya Sathi via Google Fit. This syncs heart rate, steps, and sleep data into the app.

---

## Step 1: Get a Google OAuth Client ID (5 minutes)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services > Library**
4. Search for **"Google Fit API"** and click **Enable**
5. Go to **APIs & Services > Credentials**
6. Click **Create Credentials > OAuth Client ID**
7. Set Application type to **Web application**
8. Under **Authorized redirect URIs**, add:
   ```
   http://localhost:4202/auth/google-fit
   ```
9. Click **Create**
10. Copy the generated **Client ID** (ends with `.apps.googleusercontent.com`)

> **Note:** You may need to configure the OAuth consent screen first. Set it to "External" test mode for development.

---

## Step 2: Connect in the App

1. Open the app at [http://localhost:4202](http://localhost:4202)
2. Navigate to **Devices**
3. Click the **Google Fit** tab
4. Paste your Client ID in the input box and click **Save**
5. Click **Connect Google Fit**
6. Sign in with the Google account linked to your wearable
7. Click **Sync Data Now** to fetch your health data

The app will display:
- **Average Heart Rate** (bpm)
- **Total Steps** (last 7 days)
- **Average Sleep** (hours)
- **Individual readings** with timestamps

---

## Step 3: Link Your Wearable to Google Fit

### Noise Watches
1. Install the **NoiseFit** app on your phone
2. Open NoiseFit > **Settings**
3. Find **Google Fit** or **Health Connect** integration
4. Enable sync
5. Your Noise watch data will now flow to Google Fit

### Fitbit
1. Open the **Fitbit** app
2. Go to **Profile > Settings > Applications**
3. Tap **Google Fit** and connect
4. Select which data to sync

### Samsung Galaxy Watch
1. Open **Samsung Health** app
2. Go to **Settings > Other data management**
3. Tap **Data > Samsung Health data in Google Fit**
4. Enable sync

### Wear OS Watches
Wear OS syncs directly with Google Fit by default. Ensure:
1. Google Fit app is installed on your phone
2. Data sources are enabled in Google Fit settings

### Other Devices
Any device that syncs with Google Fit or Health Connect will work, including:
- Garmin (via Garmin Connect > Google Fit)
- Xiaomi Mi Band (via Mi Fit > Google Fit)
- Huawei Watch (via Huawei Health > Google Fit)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid Client ID" | Ensure the redirect URI exactly matches `http://localhost:4202/auth/google-fit` |
| Popup blocked | Allow popups for `localhost` in your browser |
| No data after sync | Check that your wearable is syncing to Google Fit in its own app |
| Token expired | Click "Connect Google Fit" again to re-authenticate |
| CORS errors | Ensure Google Fit API is enabled in Google Cloud Console |

---

## Supported Data Types

| Data Type | Source | Display Unit |
|-----------|--------|--------------|
| Heart Rate | Google Fit heart rate API | bpm |
| Steps | Google Fit step count API | steps |
| Sleep | Google Fit sleep segments API | hours |

---

## Security Notes

- Your Google OAuth token is stored in `localStorage` and expires after 1 hour
- The token is revoked when you disconnect
- No health data is sent to third-party servers
- The Client ID is stored locally in your browser only
