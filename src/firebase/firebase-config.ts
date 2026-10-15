import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';

import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA4GuTFihoi4BROuuubQTSIKaArbv_vj_c",
  authDomain: "sanskrit-strands.firebaseapp.com",
  projectId: "sanskrit-strands",
  storageBucket: "sanskrit-strands.firebasestorage.app",
  messagingSenderId: "133351535912",
  appId: "1:133351535912:web:ee9c9856b4bd9303f44c1d"
};

const app = initializeApp(firebaseConfig);

export const auth =
  getAuth(app);

export const db =
  getFirestore(app);

export const storage =
  getStorage(app);

export const provider =
  new GoogleAuthProvider();

provider.setCustomParameters({
  prompt: 'select_account',
});

export {
  signInWithPopup,
  onAuthStateChanged,
  signOut,
};