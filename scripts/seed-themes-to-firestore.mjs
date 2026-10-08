import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const themes = JSON.parse(fs.readFileSync(path.join(root, 'public', 'data', 'themes.json'), 'utf8'));

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Missing GOOGLE_APPLICATION_CREDENTIALS. Point it to a Firebase/Google Cloud service-account JSON file that you are authorized to use.');
  process.exit(1);
}

const projectId = process.env.FIREBASE_PROJECT_ID || 'zat-am-main';
initializeApp({ credential: applicationDefault(), projectId });
const db = getFirestore();

for (const [index, theme] of themes.entries()) {
  const ref = db.collection('strands-themes').doc(theme.id);
  await ref.set({
    ...theme,
    order: index + 1,
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: false });
  console.log(`Uploaded ${theme.id} (${index + 1}/${themes.length})`);
}

console.log(`Done. Uploaded ${themes.length} Sanskrit Strands levels to ${projectId}/strands-themes.`);
