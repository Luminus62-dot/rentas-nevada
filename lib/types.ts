export type Listing = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  price: number;
  deposit: number | null;
  type: "room" | "apartment" | "house";
  furnished: boolean;
  available_from: string | null; // date string
  city: string | null;
  area: string | null;
  verified_status: "none" | "pending" | "verified";
  verified_at: string | null;
  is_featured: boolean;
  created_at: string;
};
