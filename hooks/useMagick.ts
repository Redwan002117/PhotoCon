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
    const [isInitializing, setIsInitializing] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const initialized = useRef(false);
    const initPromise = useRef<Promise<void> | null>(null);

    const initializeMagick = async () => {
        // If already initialized or initializing, return existing promise
        if (initialized.current) return Promise.resolve();
        if (initPromise.current) return initPromise.current;

        initialized.current = true;
        setIsInitializing(true);
        setLoadProgress(0);

        initPromise.current = (async () => {
            try {
                console.log("🔄 Loading ImageMagick WASM...");

                // Fetch the WASM file with progress tracking
                const wasmUrl = "/wasm/magick.wasm";
                const response = await fetch(wasmUrl);

                if (!response.ok) {
                    throw new Error(`Failed to fetch WASM file: ${response.statusText}`);
                }

                // Get content length for progress calculation
                const contentLength = response.headers.get('content-length');
                const total = parseInt(contentLength || '0', 10);

                if (!response.body) {
                    throw new Error('No response body');
                }

                // Read stream with progress tracking
                const reader = response.body.getReader();
                let receivedLength = 0;
                const chunks: Uint8Array[] = [];

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    chunks.push(value);
                    receivedLength += value.length;

                    // Update progress
                    if (total > 0) {
                        const progress = Math.round((receivedLength / total) * 100);
                        setLoadProgress(progress);
                        console.log(`📦 WASM Download: ${progress}%`);
                    }
                }

                // Combine chunks into single array
                const chunksAll = new Uint8Array(receivedLength);
                let position = 0;
                for (const chunk of chunks) {
                    chunksAll.set(chunk, position);
                    position += chunk.length;
                }

                console.log("⚙️ Initializing ImageMagick...");
                // Initialize with the bytes
                await initializeImageMagick(chunksAll.buffer);

                console.log("✅ ImageMagick WASM Initialized");
                setIsReady(true);
                setIsInitializing(false);
            } catch (err: any) {
                console.error("❌ Failed to load ImageMagick WASM:", err);
                setError(err?.message || "Failed to load ImageMagick WebAssembly");
                setIsInitializing(false);
                initialized.current = false; // Allow retry
                initPromise.current = null;
                throw err;
            }
        })();

        return initPromise.current;
    };

    // Conditional loading - no auto-initialization
    // WASM will be initialized when needed by specific tools

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

    return { isReady, isInitializing, loadProgress, error, convertFile, initializeMagick };
}
