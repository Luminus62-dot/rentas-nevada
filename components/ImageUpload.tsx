"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

interface ImageUploadProps {
    images: string[];
    onChange: (urls: string[]) => void;
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);

    async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
        try {
            if (!e.target.files || e.target.files.length === 0) return;

            setUploading(true);
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('listings')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('listings')
                .getPublicUrl(filePath);

            onChange([...images, publicUrl]);

        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Error al subir imagen");
        } finally {
            setUploading(false);
        }
    }

    function removeImage(index: number) {
        const newImages = [...images];
        newImages.splice(index, 1);
        onChange(newImages);
    }

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-foreground/80">Fotos de la Propiedad</label>

            <div className="flex flex-wrap gap-4">
                {images.map((url, index) => (
                    <div key={index} className="relative w-32 h-32 rounded-lg overflow-hidden border border-border group">
                        <Image src={url} alt="Listing" fill className="object-cover" />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            ✕
                        </button>
                    </div>
                ))}

                <div className="w-32 h-32 relative border-2 border-dashed border-border rounded-lg hover:bg-muted/50 transition-colors flex flex-col items-center justify-center cursor-pointer">
                    {uploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    ) : (
                        <>
                            <span className="text-2xl text-muted-foreground">+</span>
                            <span className="text-xs text-muted-foreground mt-1">Subir Foto</span>
                        </>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={uploadImage}
                        disabled={uploading}
                        className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                </div>
            </div>
        </div>
    );
}
