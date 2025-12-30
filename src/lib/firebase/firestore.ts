'use client';
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  collection,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { deleteFile } from './storage';
import { Family } from '@/lib/types';
import { initializeFirebase } from '@/firebase';

const { firestore } = initializeFirebase();

export async function saveFamily(
  familyData: Omit<Family, 'id'>,
  familyId?: string
) {
  const familyRef = familyId
    ? doc(firestore, 'families', familyId)
    : doc(collection(firestore, 'families'));

  const newFamilyData: Family = {
    id: familyRef.id,
    ...familyData,
  };

  await setDoc(familyRef, newFamilyData, { merge: true });
  return newFamilyData;
}

export async function deleteFamily(familyId: string) {
  const familyRef = doc(firestore, 'families', familyId);
  // In a real app, you might want to delete associated files from Storage
  // For now, we just delete the Firestore record
  await deleteDoc(familyRef);
}

// Seed functions
const defaultPermissions = {
  SUPER_ADMIN: { view: true, create: true, update: true, delete: true, export: true },
  ADMIN: { view: true, create: true, update: true, delete: true, export: true },
  ASSOCIATE: { view: true, create: true, update: true, delete: true, export: true },
  CUSTOMER: { view: true, create: true, update: true, delete: true, export: true },
  FAMILY_MANAGER: { view: true, create: true, update: true, delete: true, export: true },
  DOC_VAULT: { view: true, create: true, update: true, delete: true, export: true },
};

export async function seedDefaultPermissions(db: any) {
  const roles = ['SUPER_ADMIN', 'ADMIN', 'ASSOCIATE', 'CUSTOMER'];
  const batch = writeBatch(db);

  roles.forEach(role => {
    const roleRef = doc(db, 'permissions', role);
    batch.set(roleRef, defaultPermissions);
  });

  await batch.commit();
}

export async function checkAndSeedPermissions(db: any) {
  const permissionsCollection = collection(db, 'permissions');
  const snapshot = await getDocs(permissionsCollection);
  if (snapshot.empty) {
    console.log('Permissions collection is empty, seeding default data...');
    await seedDefaultPermissions(db);
    return true; // Indicates seeding was performed
  }
  return false; // Indicates no seeding was needed
}
