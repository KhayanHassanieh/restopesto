/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Admin SDK init with default credentials (works with gen2 Cloud Run)
initializeApp({
  credential: applicationDefault(),
});

app.post('/', async (req, res) => {
  const { uid, newEmail, newPassword } = req.body;

  if (!uid) {
    return res.status(400).json({ success: false, message: 'UID is required.' });
  }

  try {
    const updates = {};
    if (newEmail) updates.email = newEmail;
    if (newPassword) updates.password = newPassword;

    await getAuth().updateUser(uid, updates);

    return res.status(200).json({ success: true, message: 'User updated successfully.' });
  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

exports.updateRestaurantUser = functions.https.onRequest(app);

const { getFirestore } = require('firebase-admin/firestore');
const { onSchedule } = require('firebase-functions/v2/scheduler');

const db = getFirestore();

exports.checkExpiredRestaurants = onSchedule(
    {
      // Run on the 1st of every month at 3:00 AM Beirut time
      schedule: '0 0 1 * *',
      timeZone: 'Asia/Beirut',
    },
    async (event) => {
      const now = new Date();
      const snapshot = await db.collection('restaurants').get();
  
      const batch = db.batch();
      let expiredCount = 0;
  
      snapshot.forEach((doc) => {
        const data = doc.data();
        const expiresAt = data.expiresAt?.toDate?.() || new Date(data.expiresAt);
  
        if (expiresAt && now > expiresAt && data.isActive !== false) {
          console.log(`Disabling expired restaurant: ${data.name || doc.id}`);
          batch.update(doc.ref, { isActive: false });
          expiredCount++;
        }
      });
  
      if (expiredCount > 0) {
        await batch.commit();
        console.log(`✅ ${expiredCount} restaurants disabled.`);
      } else {
        console.log('No expired restaurants found.');
      }
    }
  );
  

  
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
