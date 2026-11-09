<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/9444bc2a-4508-48ed-9025-48d3f3c13b71

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Firebase Authentication and Firestore

The Express API verifies farmer Firebase ID tokens with Firebase Admin and stores application records in Cloud Firestore. Operator and administrator login keep their existing backend credentials. Firestore is accessed only by the server; the included client rules deny direct browser reads and writes.

1. Copy `.env.example` to `.env` and set `FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT_PATH` (or `GOOGLE_APPLICATION_CREDENTIALS`) to the local service-account JSON path, and `JWT_SECRET` for the existing operator/admin session flow. Keep the service-account file and `.env` out of version control.
2. In Firebase Console → Authentication → Sign-in method, enable **Email/Password** and **Google** for farmers. Operators continue to sign in with their existing centre credentials.
3. Run `npm install`, then `npm run dev`.
4. With the server running, `GET /api/auth/providers` reports whether Email/Password and Google are enabled. The service account needs permission to verify Firebase ID tokens, access Firestore, and read Authentication project configuration.
5. Deploy the included deny-by-default client rules and index configuration when ready: `firebase deploy --only firestore:rules,firestore:indexes --project kisan-marg-19c0a`.

The API bootstraps an empty Firestore collection from the existing demo seed once. After that, Firestore is authoritative. Collections used are `users`, `farmers`, `operators`, `centres`, `crops`, `centreCrops`, `slots`, `bookings`, `queue`, `procurements`, `payments`, and `notifications`; a `counters` collection provides transaction-safe centre tokens. Booking and slot capacity changes use Firestore transactions.
