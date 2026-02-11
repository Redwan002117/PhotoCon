"use client";

import { useMagick, MagickFormat } from "./useMagick";
import { ImageMagick } from "@imagemagick/magick-wasm";

export interface CompressionResult {
    blob: Blob;
    quality: number;
    size: number;
    iterations: number;
}

export function useImageCompressor() {
    const { isReady, error } = useMagick();

    const compressToSize = async (
        file: File,
        targetSizeKB: number,
        format: MagickFormat = MagickFormat.Jpg
    ): Promise<CompressionResult> => {

        if (!isReady) {
            throw new Error("ImageMagick not ready. Please wait for WASM to load.");
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = e.target?.result as ArrayBuffer;
                if (!data) {
                    reject(new Error("Failed to read file"));
                    return;
                }

                try {
                    const array = new Uint8Array(data);

                    ImageMagick.read(array, (image) => {
                        const targetBytes = targetSizeKB * 1024;
                        // Use higher quality range (60-95) for better visual quality
                        let min = 60;
                        let max = 95;
                        let bestBlob: Blob | null = null;
                        let bestQuality = 0;
                        let bestDiff = Infinity;
                        let iterations = 0;

                        // Binary search for closest size with high quality
                        for (let i = 0; i < 10; i++) {
                            iterations++;
                            const currentQuality = Math.floor((min + max) / 2);
                            image.quality = currentQuality;

                            let blobSize = 0;
                            let blobData: Uint8Array | null = null;

                            image.write(format, (data) => {
                                blobSize = data.length;
                                blobData = data;
                            });

                            if (!blobData) break;

                            const diff = Math.abs(blobSize - targetBytes);

                            if (diff < bestDiff) {
                                bestDiff = diff;
                                bestBlob = new Blob([blobData as any], { type: getMimeType(format) });
                                bestQuality = currentQuality;
                            }

                            if (blobSize > targetBytes) {
                                max = currentQuality - 1;
                            } else {
                                min = currentQuality + 1;
                            }

                            if (min > max) break;
                        }

                        if (bestBlob) {
                            resolve({
                                blob: bestBlob,
                                quality: bestQuality,
                                size: bestBlob.size,
                                iterations
                            });
                        } else {
                            reject(new Error("Could not compress to target size"));
                        }
                    });
                } catch (err) {
                    console.error("Compression error:", err);
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsArrayBuffer(file);
        });
    };

    const getMimeType = (format: MagickFormat): string => {
        switch (format) {
            case MagickFormat.Jpg: return "image/jpeg";
            case MagickFormat.Png: return "image/png";
            case MagickFormat.WebP: return "image/webp";
            case MagickFormat.Avif: return "image/avif";
            default: return "image/jpeg";
        }
    };

    return { isReady, error, compressToSize };
}
