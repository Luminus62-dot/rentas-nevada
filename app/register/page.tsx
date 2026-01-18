"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validateEmail, validatePassword, validateRequired, validateMinLength } from "@/lib/validation";
import { getErrorMessage } from "@/lib/errorHandler";
import { InteractiveBackground } from "@/components/InteractiveBackground";
import { Card } from "@/components/Card";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"tenant" | "landlord">("tenant"); // Default to Regular User

  // Errors
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [fullNameError, setFullNameError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setEmailError(null);
    setPasswordError(null);
    setFullNameError(null);

    // Validate
    const fullNameValidation = validateRequired(fullName, "El nombre") || validateMinLength(fullName, 2, "El nombre");
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (fullNameValidation) { setFullNameError(fullNameValidation); return; }
    if (emailValidation) { setEmailError(emailValidation); return; }
    if (passwordValidation) { setPasswordError(passwordValidation); return; }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

      if (signUpError) {
        setError(getErrorMessage(signUpError));
        setLoading(false);
        return;
      }

      const userId = data.user?.id;
      if (userId) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: userId,
          full_name: fullName,
          role: role, // Save selected role
          is_verified: false, // Default false
        });

        if (profileError) {
          setError(`Cuenta creada, pero error en perfil: ${getErrorMessage(profileError)}`);
          setLoading(false);
          return;
        }
      }

      // Success
      router.push("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }

  const inputClass = (err: string | null) =>
    `w-full px-4 py-3 bg-background/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-300 ${err ? "border-red-500" : "border-border hover:border-primary/50"}`;

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center bg-dots-pattern overflow-hidden py-10">
      <InteractiveBackground />
      {/* Decorative Background Elements */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-float -z-10" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[80px] animate-float -z-10" style={{ animationDelay: "3s" }} />

      <Card className="max-w-md w-full p-8 border-white/20 dark:border-white/5 shadow-2xl glass backdrop-blur-md animate-fade-in relative z-10">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4 text-2xl">
            ✨
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Crear Cuenta</h1>
          <p className="text-muted-foreground mt-2">Unete a la comunidad de Rentas Nevada</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">

          {/* User Type Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground/80 ml-1">¿Cómo planeas usar la plataforma?</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole("tenant")}
                className={`p-3 rounded-xl border text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${role === "tenant" ? "border-primary bg-primary/5 text-primary ring-1 ring-primary shadow-sm" : "border-border hover:bg-muted/50 text-muted-foreground"}`}
              >
                👤 Busco Rentar
                <span className="block text-xs font-normal mt-1 opacity-70">Usuario Regular</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("landlord")}
                className={`p-3 rounded-xl border text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${role === "landlord" ? "border-primary bg-primary/5 text-primary ring-1 ring-primary shadow-sm" : "border-border hover:bg-muted/50 text-muted-foreground"}`}
              >
                🏠 Quiero Publicar
                <span className="block text-xs font-normal mt-1 opacity-70">Publicante</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <input
                className={inputClass(fullNameError)}
                type="text"
                placeholder="Nombre completo"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fullNameError) setFullNameError(null);
                }}
              />
              {fullNameError && <p className="text-red-500 text-xs mt-1 animate-slide-up">{fullNameError}</p>}
            </div>

            {/* Email */}
            <div>
              <input
                className={inputClass(emailError)}
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
              />
              {emailError && <p className="text-red-500 text-xs mt-1 animate-slide-up">{emailError}</p>}
            </div>

            {/* Password */}
            <div>
              <input
                className={inputClass(passwordError)}
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => {
                  const val = e.target.value;
                  setPassword(val);
                  if (passwordError) setPasswordError(null);
                }}
              />

              {/* Password Requirements Checklist */}
              <div className="mt-3 space-y-2 bg-muted/40 p-3 rounded-xl border border-border/50 backdrop-blur-sm">
                <p className="text-xs font-semibold text-muted-foreground">Requisitos de seguridad:</p>

                <div className="grid grid-cols-1 gap-1">
                  <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${password.length >= 6 ? "text-green-600 dark:text-green-400 font-medium" : "text-muted-foreground"}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] border transition-colors duration-300 ${password.length >= 6 ? "bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800" : "border-muted-foreground/30 bg-background/50"}`}>
                      {password.length >= 6 && "✓"}
                    </span>
                    Mínimo 6 caracteres
                  </div>

                  <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${/[A-Z]/.test(password) ? "text-green-600 dark:text-green-400 font-medium" : "text-muted-foreground"}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] border transition-colors duration-300 ${/[A-Z]/.test(password) ? "bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800" : "border-muted-foreground/30 bg-background/50"}`}>
                      {/[A-Z]/.test(password) && "✓"}
                    </span>
                    Una letra mayúscula
                  </div>

                  <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${/[0-9]/.test(password) ? "text-green-600 dark:text-green-400 font-medium" : "text-muted-foreground"}`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] border transition-colors duration-300 ${/[0-9]/.test(password) ? "bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800" : "border-muted-foreground/30 bg-background/50"}`}>
                      {/[0-9]/.test(password) && "✓"}
                    </span>
                    Un número
                  </div>
                </div>
              </div>

              {passwordError && <p className="text-red-500 text-xs mt-1 animate-slide-up">{passwordError}</p>}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm animate-slide-up text-center font-medium">
              {error}
            </div>
          )}

          <button
            className="w-full bg-gradient-to-r from-primary to-indigo-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registrando...
              </span>
            ) : "Crear Cuenta"}
          </button>

          <p className="text-center text-sm text-muted-foreground mt-4">
            ¿Ya tienes cuenta? <Link href="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors hover:underline">Inicia Sesión</Link>
          </p>

        </form>
      </Card>
    </div>
  );
}
