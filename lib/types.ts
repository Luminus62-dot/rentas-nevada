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
  neighborhood: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  verified_status: "none" | "pending" | "verified" | "archived";
  verified_at: string | null;
  is_featured: boolean;
  images: string[] | null; // URLs
  amenities: Record<string, boolean> | null;
  created_at: string;
  profiles?: {
    full_name: string;
    id: string;
    is_verified: boolean;
    role: "admin" | "user" | "landlord" | "tenant";
    created_at: string;
    whatsapp?: string;
  };
};

export type Profile = {
  id: string;
  full_name: string | null;
  role: "admin" | "user" | "landlord" | "tenant";
  is_verified: boolean;
  whatsapp?: string;
  created_at: string;
};

export type ServiceType = "verification" | "featured" | "posted_by_us";

export type ServiceRequestStatus = "new" | "in_progress" | "done" | "rejected";

export type ServiceRequest = {
  id: string;
  listing_id: string;
  owner_id: string;
  service_type: ServiceType;
  status: ServiceRequestStatus;
  notes: string | null;
  created_at: string;
};

export type Lead = {
  id: string;
  listing_id: string;
  from_user_id?: string;
  name: string | null;
  message: string;
  created_at: string;
};

export type ListingUpdatePayload = {
  verified_status: "none" | "pending" | "verified" | "archived";
  verified_at?: string;
};

export type Conversation = {
  id: string;
  listing_id: string;
  tenant_id: string;
  landlord_id: string;
  status: 'active' | 'finished';
  deleted_by_tenant: boolean;
  deleted_by_landlord: boolean;
  created_at: string;
  updated_at: string;
  listing?: { title: string };
  tenant?: { id: string; full_name: string };
  landlord?: { id: string; full_name: string };
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};