import { useEffect, useState } from 'react';
import { getFirebaseDatabase, getFirebaseAuth, isFirebaseConfigured } from '../config/firebase';
import { Database } from 'firebase/database';
import { Auth } from 'firebase/auth';

export interface FirebaseState {
  database: Database | null;
  auth: Auth | null;
  isConfigured: boolean;
  isInitialized: boolean;
  error: string | null;
}

export function useFirebase(): FirebaseState {
  const [state, setState] = useState<FirebaseState>({
    database: null,
    auth: null,
    isConfigured: false,
    isInitialized: false,
    error: null,
  });

  useEffect(() => {
    try {
      const configured = isFirebaseConfigured();
      
      if (!configured) {
        setState({
          database: null,
          auth: null,
          isConfigured: false,
          isInitialized: true,
          error: 'Firebase is not configured. Please set environment variables.',
        });
        return;
      }

      const database = getFirebaseDatabase();
      const auth = getFirebaseAuth();

      setState({
        database,
        auth,
        isConfigured: configured,
        isInitialized: true,
        error: null,
      });
    } catch (error: any) {
      setState({
        database: null,
        auth: null,
        isConfigured: false,
        isInitialized: true,
        error: error.message || 'Failed to initialize Firebase',
      });
    }
  }, []);

  return state;
}
