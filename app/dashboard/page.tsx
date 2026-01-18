"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { InteractiveBackground } from "@/components/InteractiveBackground";
import { TenantDashboard } from "@/components/dashboards/TenantDashboard";
import { LandlordDashboard } from "@/components/dashboards/LandlordDashboard";
import { Card } from "@/components/Card";
import type { Listing, Lead, ServiceType } from "@/lib/types"; // Import types if needed, though dashboards might handle data internally now

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login"); // Secure redirect
        return;
      }
      setUser(user);

      // Load Profile for Role
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    }
    loadSession();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dots-pattern">
        <div className="text-primary animate-pulse font-medium">Cargando tu espacio...</div>
      </div>
    );
  }

  // Determine which dashboard to show
  const isLandlord = profile?.role === 'landlord';
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-dots-pattern relative overflow-hidden">
      <InteractiveBackground />
      {/* Background Decor */}
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-float" />

      <main className="container-custom py-10 relative z-10">

        {/* Admin Shortcut */}
        {isAdmin && (
          <div className="mb-6 bg-purple-900/10 border border-purple-500/20 p-4 rounded-xl flex justify-between items-center">
            <span className="text-purple-700 dark:text-purple-300 font-medium flex items-center gap-2">🛡️ Tienes privilegios de Administrador</span>
            <button onClick={() => router.push('/admin')} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">
              Ir al Panel Admin
            </button>
          </div>
        )}

        {(isLandlord || isAdmin) ? (
          <LandlordDashboard user={{ ...user, ...profile }} />
        ) : (
          <TenantDashboard user={{ ...user, ...profile }} />
        )}
      </main>
    </div>
  );
}
