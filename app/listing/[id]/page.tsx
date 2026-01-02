import type { Listing } from "@/lib/types";
import { supabaseServer } from "../../../lib/supabaseServer";
import LeadForm from "@/components/LeadForm";


export default async function ListingDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data, error } = await supabaseServer
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return <p>No encontrado</p>;

  const listing = data as Listing;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">{listing.title}</h1>
      <p className="mt-2">${listing.price} / mes</p>

      <p className="mt-2 text-gray-700">
        {listing.city ?? ""} {listing.area ? `• ${listing.area}` : ""}
      </p>

      <p className="mt-2">
        Tipo: <b>{listing.type}</b> •{" "}
        {listing.furnished ? "Amueblado" : "No amueblado"}
      </p>

      {listing.available_from && (
        <p className="mt-2">Disponible desde: {listing.available_from}</p>
      )}

      {listing.verified_status === "verified" ? (
        <p className="mt-3 text-green-600">✅ Verificado</p>
      ) : (
        <p className="mt-3 text-yellow-700">⏳ No verificado</p>
      )}

      {listing.description && (
        <p className="mt-4 whitespace-pre-wrap">{listing.description}</p>
      )}
      <LeadForm listingId={id} />

    </div>
    
  );
}
