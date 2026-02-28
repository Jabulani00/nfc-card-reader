# NFC Emission (HCE) – Step-by-Step Implementation Guide

This guide adds **Host Card Emulation (HCE)** so the app can **emit** an NFC signal that other devices (readers, gates, other phones) can detect. The emitted tag will contain the **current user’s identifier** from Firebase (`nfcId` or `uid`) so readers can look up the user in Firebase.

---

## What You’ll Achieve

- When the user taps **“Tap Access”** on My Card, the phone starts **emulating an NFC Type 4 tag**.
- The tag content is the **logged-in user’s `nfcId`** (or `uid` if no `nfcId`), i.e. **Firebase-backed data**.
- Any NFC reader (gate, terminal, or another phone) that scans the device will read this ID and can then call `UserService.getUserByNfcId(nfcId)` (or look up by `uid`) to get full user data from Firebase.

---

## Prerequisites

- Android device with NFC and HCE support (no iOS HCE support).
- Existing Firebase user with `nfcId` or `uid` (admin-assigned or fallback).
- Development build (e.g. `expo run:android`), not Expo Go (native module required).

---

## Step 1: Install the HCE Library

The dependency is already added to `package.json`. In the project root, install it:

```bash
npm install
```

Or with yarn:

```bash
yarn install
```

Rebuild the Android app after completing the native config (Step 4).

---

## Step 2: Create AID List for NFC Type 4 Tag

NFC Type 4 tags use a specific Application ID (AID). The library expects it in an XML file.

1. Create the directory if it doesn’t exist:
   - **Path:** `android/app/src/main/res/xml/`
   - Create the `xml` folder inside `res`.

2. Create **`android/app/src/main/res/xml/aid_list.xml`** with:

```xml
<?xml version="1.0" encoding="utf-8"?>
<host-apdu-service xmlns:android="http://schemas.android.com/apk/res/android"
                   android:description="@string/app_name"
                   android:requireDeviceUnlock="false">
  <aid-group android:category="other"
             android:description="@string/app_name">
    <!-- NFC Type 4 tag emulation AID -->
    <aid-filter android:name="D2760000850101" />
  </aid-group>
</host-apdu-service>
```

This tells Android that your app can emulate an NFC Type 4 tag when a reader uses the standard NDEF AID.

---

## Step 3: Update AndroidManifest.xml

Open **`android/app/src/main/AndroidManifest.xml`**.

1. **Add NFC permission and feature** (inside `<manifest>`, e.g. after existing `<uses-permission>`):

```xml
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc.hce" android:required="true" />
```

2. **Register the HCE service** (inside `<application>`, before `</application>`):

```xml
<service
    android:name="com.reactnativehce.services.CardService"
    android:exported="true"
    android:enabled="false"
    android:permission="android.permission.BIND_NFC_SERVICE">
    <intent-filter>
      <action android:name="android.nfc.cardemulation.action.HOST_APDU_SERVICE" />
      <category android:name="android.intent.category.DEFAULT"/>
    </intent-filter>
    <meta-data
      android:name="android.nfc.cardemulation.host_apdu_service"
      android:resource="@xml/aid_list" />
</service>
```

- `android:enabled="false"` is correct: the app will enable the service only when the user taps “Tap Access”.
- Save the file.

---

## Step 4: Rebuild the Android App

Native changes require a full rebuild:

```bash
npx expo run:android
```

Or, if you use a dev client:

```bash
npm run android
```

Install and run on a physical NFC-capable Android device (emulators usually don’t support NFC/HCE).

---

## Step 5: HCE Hook and Tag Content (Firebase User ID)

The app must:

- Use the **current user** from Firebase (from your existing auth/card flow).
- When starting HCE, set the **tag content** to that user’s **`nfcId`** (or **`uid`** if `nfcId` is not set).
- Start HCE when the user taps “Tap Access” and stop when they cancel or the countdown ends.

Implementation details are in the code below:

- **`hooks/useNfcHce.ts`** – hook that:
  - Gets `HCESession` and sets an `NFCTagType4` with **Text** content = `nfcId || uid`.
  - Exposes `startEmitting(nfcIdOrUid)` and `stopEmitting()`.
- **`components/role-based-my-card-screen.tsx`** – when card becomes visible, call `startEmitting(user.nfcId || user.uid)`; when card is hidden or countdown ends, call `stopEmitting()`.

So the **signal that other devices read** is exactly the Firebase-backed identifier; readers then use your existing `UserService.getUserByNfcId(nfcId)` (or lookup by `uid`) to get full user data.

---

## Step 6: How Readers Use the Emitted Data

When another device (gate, reader app, etc.) reads your phone:

1. It gets an **NDEF Text record** whose content is the string you set (e.g. `user.nfcId` or `user.uid`).
2. It uses that string to look up the user in Firebase, e.g.:
   - `UserService.getUserByNfcId(nfcId)` if the content is `nfcId`,
   - or your existing user-by-uid logic if you use `uid`.
3. It then uses the returned user (name, role, permissions, etc.) for access control or display.

No change is required on the reader side except to parse the NDEF Text and call your existing Firebase lookup.

---

## Step 7: Testing

1. **Enable NFC** on the Android device (Settings → Connected devices → Connection preferences → NFC).
2. **Disable other HCE apps** (e.g. payment apps) in Settings → Apps → Default apps → Tap & pay (or “Contactless”), so only your app handles the tap.
3. Log in as a user that has `nfcId` (or at least `uid`) in Firebase.
4. Open **My Card** and tap **“Tap Access”**.
5. Use another NFC reader (another phone with an “NFC Tag Reader” app, or a gate/terminal) to scan the back of the phone; you should see the **text payload** = `nfcId` or `uid`.
6. Cancel or wait for the countdown; the phone should stop emulating.

---

## Platform and Security Notes

- **Android only.** iOS does not expose HCE to third-party apps.
- **Data is sent in plain form.** The tag content is not encrypted by the library. Use it for non-sensitive identifiers (e.g. `nfcId`/`uid`) and rely on Firebase rules and backend checks for real security.
- **Reader compatibility:** Most NDEF-capable readers and “NFC tag reader” apps can read Type 4 tags and the Text record.

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| “NFC not available” or HCE never starts | Ensure you did a full **native rebuild** (`expo run:android`) and are not using Expo Go. |
| Reader doesn’t see the phone | Disable other default “Tap & pay” / HCE apps. Hold the phone steady on the reader. |
| Wrong or empty content | Ensure you pass `user.nfcId \|\| user.uid` (or your chosen field) into the hook and that the user is loaded from Firebase before starting HCE. |
| AID conflict | Only one app can respond per AID. Keep only one HCE app active for testing. |

---

## Summary Checklist

- [ ] Install `react-native-hce`.
- [ ] Create `android/app/src/main/res/xml/aid_list.xml` with the Type 4 AID.
- [ ] Add NFC permission, `uses-feature` for HCE, and `CardService` in `AndroidManifest.xml`.
- [ ] Rebuild with `npx expo run:android`.
- [ ] Implement hook and My Card integration so “Tap Access” starts HCE with `nfcId` or `uid` and cancel/countdown stops it.
- [ ] Test with a reader and verify the payload, then look up the user in Firebase.

After this, your app **does** have the capability to emit an NFC signal that other devices can detect, and that signal contains the Firebase-backed user identifier for the current user.
