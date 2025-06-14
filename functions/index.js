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
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

// Create and deploy your first functions
exports.updateRestaurantUser = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
      }
  
      const idToken = req.headers.authorization?.split('Bearer ')[1];
  
      if (!idToken) {
        return res.status(401).send('Missing or invalid Authorization header');
      }
  
      try {
        // Verify ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
  
        // OPTIONAL: only allow specific emails / claims
        const adminEmail = decodedToken.email;
        const allowedAdmins = ['admin@krave.me', 'your@email.com'];
        if (!allowedAdmins.includes(adminEmail)) {
          return res.status(403).send('Unauthorized access');
        }
  
        const { uid, newEmail, newPassword } = req.body;
        if (!uid || (!newEmail && !newPassword)) {
          return res.status(400).send('Missing uid or update fields');
        }
  
        const updatePayload = {};
        if (newEmail) updatePayload.email = newEmail;
        if (newPassword) updatePayload.password = newPassword;
  
        const updatedUser = await admin.auth().updateUser(uid, updatePayload);
        return res.status(200).json({
          message: 'User updated successfully',
          updatedUser: {
            uid: updatedUser.uid,
            email: updatedUser.email,
          },
        });
      } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).send(`Failed to update user: ${error.message}`);
      }
    });
  });
  
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
