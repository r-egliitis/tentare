import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../data/supabaseClient";

export interface AuthCredentials {
  email: string;
  password: string;
}

// Tracks the current Supabase auth session: who's signed in (if anyone),
// and functions to sign up/in/out. Same shape as useTheme.ts/useDecks.ts —
// plain function, useState/useEffect, no external state library.
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  function signUp({ email, password }: AuthCredentials) {
    return supabase.auth.signUp({ email, password });
  }

  function signIn({ email, password }: AuthCredentials) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  function signOut() {
    return supabase.auth.signOut();
  }

  return { user, loading, signUp, signIn, signOut };
}
