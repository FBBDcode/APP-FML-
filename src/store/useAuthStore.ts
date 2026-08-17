import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: any | null; // Tiparemos adequadamente depois
  familyId: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  setSession: (session: Session | null) => void;
  setProfile: (profile: any | null) => void;
  setFamilyId: (familyId: string | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  familyId: null,
  isLoading: true,
  isInitialized: false,

  setSession: (session) => set({ session, user: session?.user || null }),
  setProfile: (profile) => set({ profile }),
  setFamilyId: (familyId) => set({ familyId }),
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null, familyId: null });
  },

  initialize: async () => {
    if (get().isInitialized) return;
    
    set({ isLoading: true });
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao recuperar sessão:', error);
      }
      
      set({ session, user: session?.user || null });
      
      // Assinar as mudanças de auth
      supabase.auth.onAuthStateChange((_event, session) => {
        set({ session, user: session?.user || null });
      });
      
    } catch (err) {
      console.error('Exceção ao inicializar auth:', err);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  }
}));
