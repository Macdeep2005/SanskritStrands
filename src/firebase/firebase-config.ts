import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig={apiKey:'AIzaSyC8nm8zQR6fiC_3mTQ3hURXNJPR6faKYOU',authDomain:'zat-am-main.firebaseapp.com',projectId:'zat-am-main',storageBucket:'zat-am-main.appspot.com',messagingSenderId:'1071341524876',appId:'1:1071341524876:web:1908319951cd8f50b2e8a9'};
const app=initializeApp(firebaseConfig); export const auth=getAuth(app); export const db=getFirestore(app); export const provider=new GoogleAuthProvider(); provider.setCustomParameters({prompt:'select_account'}); export {signInWithPopup,onAuthStateChanged,signOut};
