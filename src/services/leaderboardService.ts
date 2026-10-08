import type { User } from 'firebase/auth';
import { doc,getDoc,setDoc,serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase-config';
const COLLECTION='leaderboard-zatamgame', GAME_ID='sanskritStrands', GAME_NAME='Sanskrit Strands';
export async function postScore(user:User,score:number){ const day=new Date().toISOString().split('T')[0]; const id=`${user.uid}_${GAME_ID}_${day}`; const ref=doc(db,COLLECTION,id); const old=await getDoc(ref); if(old.exists()&&(old.data().score||0)>=score)return false; await setDoc(ref,{userId:user.uid,playerName:user.displayName||'Player',email:user.email||'',photoURL:user.photoURL||'',gameId:GAME_ID,gameName:GAME_NAME,score,scoreDate:day,updatedAt:serverTimestamp()}); return true; }
