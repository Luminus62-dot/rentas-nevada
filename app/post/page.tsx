"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  validateRequired,
  validatePositiveNumber,
  validateDate,
  validateMinLength,
  validateMaxLength,
} from "@/lib/validation";
import { getErrorMessage } from "@/lib/errorHandler";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { ImageUpload } from "@/components/ImageUpload"; // New Import
import { useToast } from "@/components/ToastContext";

import { InteractiveBackground } from "@/components/InteractiveBackground";
import { AmenitiesSelector } from "@/components/AmenitiesSelector";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg flex items-center justify-center">Cargando mapa...</div>
});

export default function PostPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [deposit, setDeposit] = useState<string>("");
  const [type, setType] = useState<"room" | "apartment" | "house">("room");
  const [furnished, setFurnished] = useState(false);
  const [availableFrom, setAvailableFrom] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [images, setImages] = useState<string[]>([]); // New state
  const [amenities, setAmenities] = useState<Record<string, boolean>>({});
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);

  const [titleError, setTitleError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  // Edit Mode State
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(user);

      // Check profile verification
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_verified")
        .eq("id", user.id)
        .single();

      setIsVerified(profile?.is_verified || false);

      // CHECK FOR EDIT MODE
      const params = new URLSearchParams(window.location.search);
      const editParam = params.get('edit');

      if (editParam) {
        setEditId(editParam);
        // Load Listing Data
        const { data: listing, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', editParam)
          .single();

        if (listing && !error) {
          // Verify ownership
          if (listing.owner_id !== user.id) {
            setError("No tienes permiso para editar esta propiedad.");
            return;
          }

          // Pre-fill form
          setTitle(listing.title);
          setDescription(listing.description || "");
          setPrice(String(listing.price));
          setDeposit(listing.deposit ? String(listing.deposit) : "");
          setType(listing.type);
          setFurnished(listing.furnished);
          setAvailableFrom(listing.available_from || "");
          setCity(listing.city || "");
          setArea(listing.area || "");
          setNeighborhood(listing.neighborhood || "");
          setAddress(listing.address || "");
          setLat(listing.lat);
          setLng(listing.lng);
          setImages(listing.images || []); // Load images
          setAmenities(listing.amenities || {});
        }
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGeocode() {
    if (!address) return;
    setIsGeocoding(true);
    try {
      // Search with context of Nevada/Vegas to be more accurate
      const query = encodeURIComponent(`${address}, ${city || "Las Vegas"}, Nevada`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
      const data = await res.json();

      if (data && data.length > 0) {
        const result = data[0];
        const newLat = parseFloat(result.lat);
        const newLng = parseFloat(result.lon);
        setLat(newLat);
        setLng(newLng);
        showToast("¡Ubicación encontrada!", "success");
      } else {
        showToast("No se encontró la dirección exacta.", "info");
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    } finally {
      setIsGeocoding(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setTitleError(null);
    setPriceError(null);
    setDepositError(null);
    setDateError(null);
    setDescriptionError(null);

    const titleValidation = validateRequired(title, "El título") || validateMinLength(title, 5, "El título");
    const priceValidation = validatePositiveNumber(price, "El precio");
    const depositValidation = deposit ? validatePositiveNumber(deposit, "El depósito", true) : null;
    const dateValidation = validateDate(availableFrom, "La fecha de disponibilidad", false);
    const descriptionValidation = description ? validateMaxLength(description, 2000, "La descripción") : null;

    if (titleValidation) { setTitleError(titleValidation); return; }
    if (priceValidation) { setPriceError(priceValidation); return; }
    if (depositValidation) { setDepositError(depositValidation); return; }
    if (dateValidation) { setDateError(dateValidation); return; }
    if (descriptionValidation) { setDescriptionError(descriptionValidation); return; }

    setSubmitting(true);

    try {
      const payload = {
        owner_id: user.id,
        title,
        description: description || null,
        price: Number(price),
        deposit: deposit ? Number(deposit) : null,
        type,
        furnished,
        available_from: availableFrom || null,
        city: city || null,
        area: area || null,
        neighborhood: neighborhood || null,
        address: address || null,
        lat: lat,
        lng: lng,
        images: images, // Added images to payload
        amenities: amenities,
        // If editing, we generally preserve status or reset to pending if major changes (logic for another day)
        // For now, keep status if editing, set to 'none' (pending verification) if new? 
        // Actually, if we edit, we might trigger re-verification. Let's keep existing status for simple edits.
        ...(editId ? {} : { verified_status: "pending" }),
      };

      if (editId) {
        // UPDATE
        const { error: updateError } = await supabase
          .from("listings")
          .update(payload)
          .eq("id", editId);

        if (updateError) throw updateError;
        showToast("¡Propiedad actualizada exitosamente!", "success");
        router.push(`/listing/${editId}`);
      } else {
        // INSERT
        const { data, error: insertError } = await supabase
          .from("listings")
          .insert({ ...payload, verified_status: "pending" }) // Default to pending for new
          .select("id")
          .single();

        if (insertError) throw insertError;
        showToast("¡Propiedad publicada! Pendiente de verificación.", "success");
        router.push(`/listing/${data.id}`);
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      showToast(msg, "error");
      setSubmitting(false);
    }
  }

  const inputClass = (err: string | null) =>
    `w-full px-4 py-3 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${err ? "border-red-500" : "border-border hover:border-primary/50"}`;

  if (loading) return <div className="container-custom py-20 text-center"><div className="animate-pulse">Cargando...</div></div>;

  // 1. Not Logged In
  if (!user) {
    return (
      <div className="relative min-h-[60vh] flex items-center justify-center bg-dots-pattern overflow-hidden py-20">
        <InteractiveBackground />
        <div className="absolute top-10 right-10 w-72 h-72 bg-primary/10 rounded-full blur-[80px] animate-float -z-10" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] animate-float -z-10" style={{ animationDelay: "2s" }} />

        <div className="container-custom flex justify-center relative z-10">
          <Card className="max-w-md w-full p-8 text-center space-y-6 glass border-white/20 shadow-xl backdrop-blur-md animate-fade-in">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto text-3xl mb-2">
              🔒
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Inicia Sesión</h1>
              <p className="text-muted-foreground mt-2">Necesitas una cuenta para publicar propiedades en Stay Nevada.</p>
            </div>
            <div className="flex gap-4 justify-center pt-2">
              <Link href="/login" className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95">
                Ingresar
              </Link>
              <Link href="/register" className="flex-1 bg-muted/80 backdrop-blur-sm text-foreground py-2.5 rounded-lg font-medium hover:bg-muted transition-all border border-border/50 hover:border-border active:scale-95">
                Registrarse
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 2. Not Verified
  if (!isVerified) {
    return (
      <div className="relative min-h-[70vh] flex items-center justify-center bg-dots-pattern overflow-hidden py-20">
        <InteractiveBackground />
        <div className="absolute top-20 left-20 w-80 h-80 bg-yellow-500/10 rounded-full blur-[100px] animate-float -z-10" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-orange-500/5 rounded-full blur-[80px] animate-float -z-10" style={{ animationDelay: "3s" }} />

        <div className="container-custom flex justify-center relative z-10">
          <Card className="max-w-lg w-full p-8 space-y-6 border-l-4 border-l-yellow-500 glass shadow-2xl animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center text-2xl shadow-sm">
                🛡️
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Verificación Requerida</h1>
                <p className="text-muted-foreground mt-2">
                  Para garantizar la seguridad, verificamos a todos los propietarios antes de publicar.
                </p>
              </div>
            </div>

            <div className="bg-muted/40 p-5 rounded-lg space-y-4 shadow-inner border border-border/50 backdrop-blur-sm">
              <h3 className="font-semibold text-base text-foreground">Pasos para verificar tu cuenta:</h3>

              <div className="text-sm text-muted-foreground space-y-2">
                <p>Envía un correo a <span className="font-medium text-primary">verificaciones@rentasnevada.com</span> incluyendo:</p>
                <ul className="list-disc list-inside pl-2 space-y-1.5 bg-background/40 p-3 rounded border border-border/50">
                  <li>Nombre Completo</li>
                  <li>Fecha de Nacimiento</li>
                  <li><span className="font-medium text-foreground">Fotos de la propiedad</span> (Requerido)</li>
                </ul>
              </div>

              <div className="bg-blue-50/60 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-100 dark:border-blue-900/50">
                <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <span className="text-lg">💳</span>
                  <span>
                    <span className="font-bold">Costo de verificación:</span> $50.00 USD
                  </span>
                </p>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-border/30">
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">Respuesta en 24-48hrs</span>
              <Link href="/dashboard" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 group">
                Volver al Dashboard
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 3. Verified - Show Form
  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-dots-pattern overflow-hidden py-10">
      <InteractiveBackground />
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-float -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] animate-float -z-10" style={{ animationDelay: "4s" }} />

      <div className="container-custom relative z-10">
        <Card className="max-w-3xl mx-auto p-8 animate-fade-in border-none shadow-xl bg-card/60 backdrop-blur-md">
          <div className="mb-8 border-b border-border/50 pb-6">
            <Badge variant="success" className="mb-4">Usuario Verificado</Badge>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
              {editId ? "Editar Propiedad" : "Publicar Propiedad"}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              {editId ? "Actualiza los detalles de tu anuncio." : "Comparte los detalles de tu inmueble con miles de inquilinos."}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-8">
            {/* Título */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground/80">Título del anuncio</label>
              <input
                className={inputClass(titleError)}
                type="text"
                placeholder="Ej. Habitación amplia en Summerlin con baño privado"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setTitleError(validateRequired(title, "El título") || validateMinLength(title, 5, "El título"))}
              />
              {titleError && <p className="text-red-500 text-xs font-medium">{titleError}</p>}
            </div>

            {/* Images */}
            <ImageUpload images={images} onChange={setImages} />

            {/* Precio y Depósito */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/80">Precio Mensual ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-muted-foreground">$</span>
                  <input
                    className={`${inputClass(priceError)} pl-8`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                {priceError && <p className="text-red-500 text-xs font-medium">{priceError}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/80">Depósito (Opcional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-muted-foreground">$</span>
                  <input
                    className={`${inputClass(depositError)} pl-8`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                  />
                </div>
                {depositError && <p className="text-red-500 text-xs font-medium">{depositError}</p>}
              </div>
            </div>

            {/* Tipo y Amueblado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/80">Tipo de Inmueble</label>
                <select
                  className={inputClass(null)}
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                >
                  <option value="room">Habitación / Cuarto</option>
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-4 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors w-full h-[50px] bg-background/50">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                    checked={furnished}
                    onChange={(e) => setFurnished(e.target.checked)}
                  />
                  <span className="font-medium">¿Está amueblado?</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/80">Ciudad</label>
                <input
                  className={inputClass(null)}
                  placeholder="Ej. Las Vegas, Henderson..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/80">Zona / Área (Pública)</label>
                <input
                  className={inputClass(null)}
                  placeholder="Ej. The Strip, Downtown..."
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground/80">Vecindario / Neighborhood (Específico)</label>
                  <input
                    className={inputClass(null)}
                    placeholder="Ej. Summerlin South, Enterprise..."
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground/80">Dirección Exacta (Solo Interno)</label>
                  <div className="flex gap-2">
                    <input
                      className={inputClass(null)}
                      placeholder="Ej. 123 Main St..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleGeocode())}
                    />
                    <button
                      type="button"
                      onClick={handleGeocode}
                      disabled={isGeocoding}
                      className="bg-muted px-4 rounded-lg hover:bg-muted/80 transition-colors border border-border"
                      title="Buscar en mapa"
                    >
                      {isGeocoding ? '...' : '🔍'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground/80">Ubicación Exacta (Solo Interno)</label>
                <p className="text-xs text-muted-foreground mb-2">Haz clic en el mapa para marcar la ubicación precisa. Los usuarios solo verán un radio aproximado.</p>
                <div className="h-64 relative rounded-lg overflow-hidden border border-border">
                  <LeafletMap
                    center={lat && lng ? [lat, lng] : [36.1699, -115.1398]}
                    zoom={lat && lng ? 15 : 11}
                    isPicker={true}
                    onLocationSelect={(lt, lg) => {
                      setLat(lt);
                      setLng(lg);
                    }}
                  />
                  {lat && lng && (
                    <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur px-2 py-1 rounded text-[10px] border border-border z-[400]">
                      {lat.toFixed(4)}, {lng.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground/80">Fecha de Disponibilidad</label>
              <input
                className={inputClass(dateError)}
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={availableFrom}
                onChange={(e) => setAvailableFrom(e.target.value)}
              />
              {dateError && <p className="text-red-500 text-xs font-medium">{dateError}</p>}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground/80">Descripción</label>
              <textarea
                className={inputClass(descriptionError)}
                rows={6}
                placeholder="Describe los detalles importantes: servicios incluidos, reglas de la casa, requisitos..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex justify-between mt-1">
                {descriptionError && <p className="text-red-500 text-xs font-medium">{descriptionError}</p>}
                <p className="text-xs text-muted-foreground ml-auto">{description.length}/2000</p>
              </div>
            </div>

            {/* Amenities Selector */}
            <div className="pt-6 border-t border-border/50">
              <AmenitiesSelector selectedAmenities={amenities} onChange={setAmenities} />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm border border-red-200 dark:border-red-900 flex items-center gap-2">
                ⚠️ {error}
              </div>
            )}

            <p className="text-[10px] text-muted-foreground text-center leading-tight">
              Al publicar este anuncio, confirmas que tienes los derechos legales sobre la propiedad y que la información proporcionada es verídica. Aceptas nuestros <Link href="/terms" className="text-primary hover:underline">Términos de Servicio</Link> y <Link href="/privacy" className="text-primary hover:underline">Política de Privacidad</Link>.
            </p>

            <button
              className="w-full bg-gradient-to-r from-primary to-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publicando...
                </span>
              ) : (editId ? "Guardar Cambios" : "Publicar Anuncio")}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
