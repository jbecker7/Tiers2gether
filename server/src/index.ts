import express from "express";
import admin from "firebase-admin";
import { ServiceAccount } from "firebase-admin";
import serviceAccount from "./firebase/serviceAccountKey.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

const db = admin.firestore();

const app = express();
const PORT = 5200;

// Firebase Proof of Concept
const runFirebasePOC = async () => {
  try {
    console.log("Firebase Proof of Concept Starting...");

    // Add a document to Firestore
    const newCharacterRef = db.collection("characters").doc();
    await newCharacterRef.set({
      name: "Test Character",
      series: "Test Series",
      imageUrl: "https://example.com/image.png",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Added new character with ID: ${newCharacterRef.id}`);

    // Fetch all documents from the "characters" collection
    const charactersSnapshot = await db.collection("characters").get();
    const characters = charactersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Fetched characters:", characters);
  } catch (error) {
    console.error("Error in Firebase Proof of Concept:", error);
  }
};

// Run the proof of concept
runFirebasePOC();

// Add a test route for the client
app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from the server!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
