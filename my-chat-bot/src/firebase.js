import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  writeBatch,
  limit,
  deleteDoc
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD9FF4hb56XMHcdgidOyleF5Hwa_FfdLIo",
  authDomain: "chat-bot-79c76.firebaseapp.com",
  projectId: "chat-bot-79c76",
  storageBucket: "chat-bot-79c76.appspot.com",
  messagingSenderId: "173476539338",
  appId: "1:173476539338:web:18d6fe4e20e7102c3ffd33"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export {
  auth,
  db,
  storage,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup, // ✅ for Google Sign-In
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy,
  ref,
  uploadBytes,
  getDocs,
  writeBatch,
  limit,
  getDownloadURL
};
