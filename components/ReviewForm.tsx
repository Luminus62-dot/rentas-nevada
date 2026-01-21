"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { StarRating } from "@/components/StarRating";
import { Card } from "@/components/Card";

interface ReviewFormProps {
    listingId: string;
    onSuccess?: () => void;
}

export function ReviewForm({ listingId, onSuccess }: ReviewFormProps) {
    const [propertyRating, setPropertyRating] = useState(0);
    const [landlordRating, setLandlordRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (propertyRating === 0 || landlordRating === 0) {
            setError("Please rate both categories.");
            setLoading(false);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be signed in.");

            const { error: insertError } = await supabase.from("reviews").insert({
                listing_id: listingId,
                reviewer_id: user.id,
                property_rating: propertyRating,
                landlord_rating: landlordRating,
                comment
            });

            if (insertError) {
                if (insertError.message.includes("policy")) {
                    throw new Error("You can only leave a review if you contacted the owner first.");
                }
                throw insertError;
            }

            setComment("");
            setPropertyRating(0);
            setLandlordRating(0);
            if (onSuccess) onSuccess();
            alert("Review submitted! Thanks for your feedback.");

        } catch (err: any) {
            setError(err.message || "Error submitting review.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="glass p-6 mt-8 border-primary/20">
            <h3 className="text-xl font-bold mb-4">Write a review</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Property rating</label>
                    <StarRating rating={propertyRating} onChange={setPropertyRating} size="lg" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Landlord rating (communication/response)</label>
                    <StarRating rating={landlordRating} onChange={setLandlordRating} size="lg" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Comment (optional)</label>
                    <textarea
                        className="w-full p-3 rounded-lg bg-background/50 border border-border focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="How was your experience? Was the property like the photos?"
                    />
                </div>

                {error && <div className="text-red-500 text-sm">{error}</div>}

                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {loading ? "Submitting..." : "Post review"}
                </button>
            </form>
        </Card>
    );
}
