'use client';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { initializeFirebase } from '@/firebase';

const { firebaseApp } = initializeFirebase();
const storage = getStorage(firebaseApp);

export async function uploadFile(
  file: File,
  path: string
): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

export async function deleteFile(path: string) {
  const storageRef = ref(storage, path);
  try {
    await deleteObject(storageRef);
  } catch (error: any) {
    // If the file doesn't exist, Firebase throws an error.
    // We can safely ignore it if we are just trying to clean up.
    if (error.code !== 'storage/object-not-found') {
      console.error('Error deleting file from storage:', error);
      throw error;
    }
  }
}
