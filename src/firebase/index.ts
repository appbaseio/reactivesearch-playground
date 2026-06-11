import firebase from 'firebase/app';

import 'firebase/firestore';
import { FIRE_STORE_COLLECTION_NAME } from '../utils/constants';

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

firebase.initializeApp(config);

export const firestore = firebase.firestore();

export const fireStoreCollection = firestore.collection(
  FIRE_STORE_COLLECTION_NAME
);

export default firebase;

// util functions

export const addPlaygroundState = async (stateObject: Record<string, any>) => {
  try {
    const addedPlaygroundState = await fireStoreCollection.add({
      ...stateObject,
    });
    return addedPlaygroundState.id;
  } catch (error) {
    if (error instanceof Error) {
      console.log('Error\n', error + ': ' + error.message);
    }
    return '';
  }
};

export const getPlaygroundStateById = async (docId: string) => {
  const docSnapshot = await fireStoreCollection.doc(docId).get();
  return await docSnapshot.data();
};

export const updatePlaygroundState = async (
  docId: string,
  stateObject: Record<string, any>
) => {
  await fireStoreCollection.doc(docId).update(stateObject);
};
