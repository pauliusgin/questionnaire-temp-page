import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD2xQyqYoI9keEMsJLLuByXfZ0VZ8xLigM",
  authDomain: "anketa-4cdeb.firebaseapp.com",
  projectId: "anketa-4cdeb",
  storageBucket: "anketa-4cdeb.firebasestorage.app",
  messagingSenderId: "733971126744",
  appId: "1:733971126744:web:08f98ad2ec4eb8d4017aad",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app, "default");
