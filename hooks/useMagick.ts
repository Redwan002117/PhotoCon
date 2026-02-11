"use client";

import { useEffect, useState, useRef } from "react";
import {
    initializeImageMagick,
    ImageMagick,
    MagickFormat,
} from "@imagemagick/magick-wasm";

export { MagickFormat };

export function useMagick() {
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const loadMagick = async () => {
            try {
                // Fetch the WASM file as a response, then get arrayBuffer
                const wasmUrl = "/wasm/magick.wasm";
                const response = await fetch(wasmUrl);

                if (!response.ok) {
                    throw new Error(`Failed to fetch WASM file: ${response.statusText}`);
                }

                const wasmBytes = await response.arrayBuffer();

                // Initialize with the bytes
                await initializeImageMagick(wasmBytes);

                console.log("✅ ImageMagick WASM Initialized");
                setIsReady(true);
            } catch (err: any) {
                console.error("❌ Failed to load ImageMagick WASM:", err);
                setError(err?.message || "Failed to load ImageMagick WebAssembly");
            }
        };

        loadMagick();
    }, []);

    const convertFile = async (
        file: File,
        targetFormat: MagickFormat
    ): Promise<Blob> => {
        if (!isReady) {
            throw new Error("ImageMagick is not ready yet. Please wait.");
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
                        try {
                            image.write(targetFormat, (outputData) => {
                                const blob = new Blob([outputData as any], {
                                    type: getMimeType(targetFormat)
                                });
                                resolve(blob);
                            });
                        } catch (writeErr) {
                            console.error("Write error:", writeErr);
                            reject(writeErr);
                        }
                    });
                } catch (readErr) {
                    console.error("Read error:", readErr);
                    reject(readErr);
                }
            };

            reader.onerror = (err) => {
                console.error("FileReader error:", err);
                reject(new Error("Failed to read file"));
            };

            reader.readAsArrayBuffer(file);
        });
    };

    const getMimeType = (format: MagickFormat): string => {
        switch (format) {
            case MagickFormat.Jpg: return "image/jpeg";
            case MagickFormat.Png: return "image/png";
            case MagickFormat.WebP: return "image/webp";
            case MagickFormat.Avif: return "image/avif";
            case MagickFormat.Pdf: return "application/pdf";
            case MagickFormat.Bmp: return "image/bmp";
            case MagickFormat.Tiff: return "image/tiff";
            case MagickFormat.Gif: return "image/gif";
            default: return "image/jpeg";
        }
    };

    return { isReady, error, convertFile };
}
