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


  
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
