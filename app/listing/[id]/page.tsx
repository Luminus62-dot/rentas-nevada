import { Metadata, ResolvingMetadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import ListingView from "./ListingView";
import { Listing } from "@/lib/types";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const supabase = await createSupabaseServerClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("title, description, city, neighborhood, price")
    .eq("id", params.id)
    .single();

  if (!listing) {
    return {
      title: "Property Not Found | Stay Nevada",
    };
  }

  const neighborhoodInfo = listing.neighborhood || listing.city || "Nevada";
  const title = `${listing.title} | $${listing.price} in ${neighborhoodInfo} | Stay Nevada`;
  const description = listing.description?.slice(0, 160) || `Encuentra esta propiedad en ${neighborhoodInfo}. Renta mensual de $${listing.price}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default function ListingPage({ params }: Props) {
  return <ListingView listingId={params.id} />;
}
