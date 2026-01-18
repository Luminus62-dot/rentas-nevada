"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "@/lib/i18n";

type UserProfile = {
  id: string;
  full_name: string | null;
  role: string | null;
  email?: string;
};

export default function NavBar() {
  const router = useRouter();
  const { t } = useI18n();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await loadProfile(user.id, user.email);
    }
    setLoading(false);
  }

  async function loadProfile(userId: string, email?: string) {
    if (!userId) return;

    // Safety check for UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.warn("NavBar: Invalid UUID passed to loadProfile:", userId);
      setUser({ id: userId, full_name: null, role: null, email });
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("NavBar: Error fetching profile:", error);
    }

    if (data) {
      setUser({ ...data, email });
    } else {
      // Fallback if profile doesn't exist yet but user is logged in
      setUser({ id: userId, full_name: null, role: null, email });
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const displayName = user?.full_name || user?.email?.split('@')[0] || "Usuario";

  return (
    <nav className="sticky top-0 z-50 w-full glass">
      <div className="container-custom h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            S
          </div>
          <span>Stay<span className="text-primary">Nevada</span></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/search" className="text-sm font-medium hover:text-primary transition-colors">
            {t("nav.search")}
          </Link>
          <Link href="/map" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
            <span className="text-xs">📍</span> {t("nav.map")}
          </Link>
          <Link href="/post" className="text-sm font-medium hover:text-primary transition-colors">
            {t("nav.post")}
          </Link>

          <LanguageSwitcher />

          {loading ? (
            <div className="w-20 h-8 bg-muted animate-pulse rounded"></div>
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
              >
                <span>{displayName}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-20 py-1 animate-fade-in">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-primary hover:bg-muted transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <div className="h-px bg-border my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-muted transition-colors"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm absolute w-full z-40 animate-slide-up">
          <div className="p-4 flex flex-col gap-4">
            <Link
              href="/search"
              className="px-4 py-2 hover:bg-muted rounded-lg transition-colors flex items-center justify-between"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>Buscar Rentas</span>
              <span>🔍</span>
            </Link>
            <Link
              href="/map"
              className="px-4 py-2 hover:bg-muted rounded-lg transition-colors flex items-center justify-between"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>Mapa Interactivo</span>
              <span>📍</span>
            </Link>
            <Link
              href="/post"
              className="px-4 py-2 hover:bg-muted rounded-lg transition-colors flex items-center justify-between"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span>Publicar</span>
              <span>➕</span>
            </Link>
            <div className="h-px bg-border my-1"></div>
            {user ? (
              <>
                <div className="px-4 py-2 font-medium text-sm text-muted-foreground">
                  Hola, {displayName}
                </div>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 hover:bg-muted rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="px-4 py-2 text-primary hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left px-4 py-2 text-red-500 hover:bg-muted rounded-lg transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="text-center bg-primary text-primary-foreground px-4 py-2 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
