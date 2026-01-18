import { MetadataRoute } from 'next'
import { createSupabaseServerClient } from '@/lib/supabaseServer'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createSupabaseServerClient();
    const baseUrl = 'https://rentasnevada.com';

    // 1. Fetch all listings
    const { data: listings } = await supabase
        .from('listings')
        .select('id, updated_at')
        .neq('verified_status', 'archived');

    const listingUrls = (listings || []).map((listing) => ({
        url: `${baseUrl}/listing/${listing.id}`,
        lastModified: new Date(listing.updated_at || Date.now()),
    }));

    // 2. Add static pages
    const staticUrls = [
        '',
        '/search',
        '/map',
        '/faq',
        '/terms',
        '/privacy',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
    }));

    return [...staticUrls, ...listingUrls];
}
