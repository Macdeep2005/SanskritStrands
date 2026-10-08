import { useEffect,useState } from 'react';
import type { User } from 'firebase/auth';
import { auth,provider,signInWithPopup,onAuthStateChanged,signOut } from '../firebase/firebase-config';
export function useAuth(){ const [user,setUser]=useState<User|null>(null); const [loading,setLoading]=useState(true); const [signingIn,setSigningIn]=useState(false);
useEffect(()=>onAuthStateChanged(auth,u=>{setUser(u);setLoading(false)}),[]);
const login=async()=>{setSigningIn(true);try{await signInWithPopup(auth,provider)}finally{setSigningIn(false)}}; const logout=()=>signOut(auth); return {user,loading,signingIn,login,logout}; }
