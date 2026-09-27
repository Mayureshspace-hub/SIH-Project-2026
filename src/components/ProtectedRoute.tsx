import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export const ProtectedRoute: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          setHasSession(!!data?.session);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setHasSession(false);
          setLoading(false);
        }
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setHasSession(!!session);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-700">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-stone-500 font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  if (!hasSession) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
