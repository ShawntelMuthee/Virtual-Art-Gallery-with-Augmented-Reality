import { db } from '../config/firebase';
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';

export async function addStyle(name) {
  const q = query(collection(db, 'styles'), where('name', '==', name), limit(1));
  const existing = await getDocs(q);
  if (!existing.empty) return existing.docs[0].id;
  const docRef = await addDoc(collection(db, 'styles'), {
    name,
    created_at: serverTimestamp(),
  });
  return docRef.id;
}

export async function addTheme(name) {
  const q = query(collection(db, 'themes'), where('name', '==', name), limit(1));
  const existing = await getDocs(q);
  if (!existing.empty) return existing.docs[0].id;
  const docRef = await addDoc(collection(db, 'themes'), {
    name,
    created_at: serverTimestamp(),
  });
  return docRef.id;
}

export async function createUserProfile({ uid, email, full_name, role = 'USER' }) {
  await setDoc(
    doc(db, 'users', uid),
    {
      email,
      full_name,
      role,
      created_at: serverTimestamp(),
    },
    { merge: true }
  );
  return uid;
}

export async function createArtistProfile({ user_id, username, bio = '' }) {
  const profileId = user_id;
  await setDoc(
    doc(db, 'artist_profiles', profileId),
    {
      user_id,
      username,
      bio,
      created_at: serverTimestamp(),
    },
    { merge: true }
  );
  return profileId;
}

export async function createArtwork({
  artist_id,
  title,
  description = '',
  width = null,
  height = null,
  price = null,
  image_url,
  status = 'DRAFT',
}) {
  const docRef = await addDoc(collection(db, 'artworks'), {
    artist_id,
    title,
    description,
    width,
    height,
    price,
    image_url,
    status,
    created_at: serverTimestamp(),
  });
  return docRef.id;
}

export async function linkArtworkStyles(artworkId, styleIds = []) {
  if (!artworkId || !styleIds.length) return;
  await updateDoc(doc(db, 'artworks', artworkId), {
    style_ids: arrayUnion(...styleIds),
  });
}

export async function linkArtworkThemes(artworkId, themeIds = []) {
  if (!artworkId || !themeIds.length) return;
  await updateDoc(doc(db, 'artworks', artworkId), {
    theme_ids: arrayUnion(...themeIds),
  });
}

export async function addInteraction({ user_id, artwork_id, type }) {
  await addDoc(collection(db, 'interactions'), {
    user_id,
    artwork_id,
    type,
    created_at: serverTimestamp(),
  });
}

export async function addRecommendation({ user_id, artwork_id, score, algorithm }) {
  await addDoc(collection(db, 'recommendations'), {
    user_id,
    artwork_id,
    score,
    algorithm,
    generated_at: serverTimestamp(),
  });
}

export async function seedExampleData() {
  const abstractId = await addStyle('Abstract');
  const portraitId = await addStyle('Portrait');
  const minimalistId = await addTheme('Minimalist');
  const surrealId = await addTheme('Surreal');

  const uid = 'demo-user-uid';
  await createUserProfile({ uid, email: 'demo@example.com', full_name: 'Demo User', role: 'USER' });
  await createArtistProfile({ user_id: uid, username: 'demoartist', bio: 'Demo bio' });

  const artId = await createArtwork({
    artist_id: uid,
    title: 'Sunset Over Water',
    description: 'A demo artwork',
    width: 100,
    height: 80,
    price: 199.99,
    image_url: 'https://example.com/demo.jpg',
    status: 'LISTED',
  });

  await linkArtworkStyles(artId, [abstractId]);
  await linkArtworkThemes(artId, [minimalistId]);

  await addInteraction({ user_id: uid, artwork_id: artId, type: 'VIEW' });
  await addRecommendation({ user_id: uid, artwork_id: artId, score: 0.87, algorithm: 'content_based_v1' });
}