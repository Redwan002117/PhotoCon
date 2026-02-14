"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// Set up PDF.js worker
if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    // Hardcode version to match package.json
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.624/pdf.worker.min.mjs`;
}
import { motion, AnimatePresence } from "framer-motion";
import { useMagick, MagickFormat } from "@/hooks/useMagick";
import { useImageCompressor } from "@/hooks/useImageCompressor";
import { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import { Tabs } from "@/components/ui/tabs";
import JSZip from "jszip";
import { saveAs } from "file-saver";
// heic2any imported dynamically to avoid SSR window error
import { Sidebar } from "@/components/core/Sidebar";
import { CanvasArea } from "@/components/core/CanvasArea";
import { getOrientation } from "@/lib/utils/exif";
import { SettingsPanel } from "@/components/core/SettingsPanel";

type ToolMode = "convert" | "compress" | "resize" | "crop" | "rotate" | "flip" | "adjust" | "filter" | "watermark" | "split";

interface FileWithStatus {
    file: File;
    previewFile?: File; // Cached converted file for HEIC/TIFF
    status: "pending" | "processing" | "done" | "error";
    result?: Blob;
    outputName?: string;
    originalSize: string;
    newSize?: string;
    errorMessage?: string;
}

const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export default function UnifiedImageTool() {
    const { isReady: magickReady, isInitializing: magickInitializing, loadProgress: magickProgress, initializeMagick, convertFile } = useMagick();
    const { isReady: compressorReady, isInitializing: compressorInitializing, loadProgress: compressorProgress, compressToSize } = useImageCompressor();

    const [mode, setMode] = useState<ToolMode>("convert");
    const [files, setFiles] = useState<FileWithStatus[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [downloadMode, setDownloadMode] = useState<"individual" | "zip">("individual");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [isPreviewProcessing, setIsPreviewProcessing] = useState(false);
    const [selectedFileIndex, setSelectedFileIndex] = useState(0);

    // Convert settings
    const [targetFormat, setTargetFormat] = useState("jpg");

    // Compress settings
    const [targetSizeKB, setTargetSizeKB] = useState(500);
    const [compressFormat, setCompressFormat] = useState("jpg");

    // Resize settings
    const [resizeMode, setResizeMode] = useState<"percentage" | "dimensions">("percentage");
    const [resizePercentage, setResizePercentage] = useState(100);
    const [resizeWidth, setResizeWidth] = useState(800);
    const [resizeHeight, setResizeHeight] = useState(600);

    // Rotate settings
    const [rotateAngle, setRotateAngle] = useState(0);

    // Flip settings
    const [flipDirection, setFlipDirection] = useState<"horizontal" | "vertical">("horizontal");

    // Crop settings
    const [cropAspectRatio, setCropAspectRatio] = useState("free");
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [aspect, setAspect] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (cropAspectRatio === "free") setAspect(undefined);
        else if (cropAspectRatio === "1:1") setAspect(1);
        else if (cropAspectRatio === "4:3") setAspect(4 / 3);
        else if (cropAspectRatio === "16:9") setAspect(16 / 9);
        else if (cropAspectRatio === "2:3") setAspect(2 / 3);
    }, [cropAspectRatio]);

    // Adjust settings
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);

    // Filter settings
    const [selectedFilter, setSelectedFilter] = useState("none");

    // Watermark settings
    const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");
    const [watermarkText, setWatermarkText] = useState("© PhotoCon");
    const [watermarkImage, setWatermarkImage] = useState<HTMLImageElement | null>(null);
    const [watermarkSize, setWatermarkSize] = useState(30); // For text: px, For image: % scale
    const [watermarkColor, setWatermarkColor] = useState("#ffffff");
    const [watermarkOpacity, setWatermarkOpacity] = useState(50);
    const [watermarkPosition, setWatermarkPosition] = useState("bottom-right");

    // Split settings
    const [splitRows, setSplitRows] = useState(3);
    const [splitCols, setSplitCols] = useState(3);

    // Tools that require WASM
    const wasmTools: ToolMode[] = ['convert', 'resize', 'rotate', 'flip', 'crop', 'adjust', 'filter', 'watermark', 'split'];
    const needsWasm = wasmTools.includes(mode);

    // Conditional WASM initialization
    useEffect(() => {
        // Initialize WASM when user selects a tool that needs it
        if (needsWasm && !magickReady && !magickInitializing) {
            console.log(`🎯 Tool "${mode}" requires WASM, initializing...`);
            initializeMagick();
        }
    }, [mode, needsWasm, magickReady, magickInitializing]);

    const handleWatermarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                setWatermarkImage(img);
            };
        }
    };

    const updatePreview = useCallback(async () => {
        let active = true;

        if (files.length === 0 || !files[selectedFileIndex]) {
            setPreviewUrl(null);
            return;
        }

        const currentItem = files[selectedFileIndex];
        const currentFile = currentItem.previewFile || currentItem.file; // Use cached preview if available

        if (!currentFile) return;

        setIsPreviewProcessing(true);
        try {
            // Note: handleUnifiedPipeline might trigger a conversion if previewFile isn't set yet
            // We should ideally update the state if a conversion happens, but handleUnifiedPipeline is pure.
            // For now, let's just rely on the pipeline.
            const blob = await handleUnifiedPipeline(currentFile, true);

            if (!active) return; // Ignore if component unmounted or index changed

            const url = URL.createObjectURL(blob);
            setPreviewUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return url;
            });
        } catch (err) {
            if (active) console.error("Preview processing error:", err);
        } finally {
            if (active) setIsPreviewProcessing(false);
        }

        return () => { active = false; };
    }, [
        files, selectedFileIndex, mode, targetFormat, targetSizeKB, compressFormat,
        resizeMode, resizePercentage, resizeWidth, resizeHeight,
        rotateAngle, flipDirection, crop, completedCrop,
        brightness, contrast, saturation, selectedFilter,
        watermarkType, watermarkText, watermarkImage, watermarkSize, watermarkColor, watermarkOpacity, watermarkPosition,
        splitRows, splitCols
    ]);

    useEffect(() => {
        const timer = setTimeout(() => {
            updatePreview();
        }, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [updatePreview]);

    // Clean up preview URL on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, []);


    const extractPagesFromPdf = async (file: File) => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        const extractedFiles: FileWithStatus[] = [];

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                context.fillStyle = '#FFFFFF';
                context.fillRect(0, 0, canvas.width, canvas.height);

                const renderTask = page.render({
                    canvasContext: context as any,
                    viewport,
                    canvas: canvas as any
                });
                await renderTask.promise;

                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
                if (blob) {
                    const pageFile = new File([blob], `${file.name.replace('.pdf', '')}_page_${i}.png`, { type: 'image/png' });
                    extractedFiles.push({
                        file: pageFile,
                        status: "pending",
                        originalSize: formatBytes(blob.size),
                    });
                }
            }
        }
        return extractedFiles;
    };

    const normalizeFile = async (file: File): Promise<File> => {
        // 1. Handle HEIC/TIFF conversion
        let processedFile = file;
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (["heic", "heif"].includes(ext || "")) {
            try {
                // Dynamically import heic2any to avoid SSR window error
                const heic2any = (await import("heic2any")).default;

                // heic2any returns a Blob or Blob[]
                const convertedBlob = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 0.9
                });

                const finalBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                processedFile = new File(
                    [finalBlob],
                    file.name.replace(/\.[^/.]+$/, ".jpg"),
                    { type: "image/jpeg" }
                );
            } catch (e) {
                console.error("Normalization (HEIC) failed:", e);
                return file;
            }
        }
        // TIFF support via Magick (if supported) or other means. 
        // For now, removing explicit TIFF check here unless we add a TIFF decoder.
        // If heic2any supports it or we want to keep the old path for TIFF:
        else if (["tiff", "tif"].includes(ext || "")) {
            if (!magickReady) {
                console.warn("Magick not ready, skipping TIFF conversion");
                return file;
            }
            try {
                const convertedBlob = await convertFile(file, MagickFormat.Png);
                processedFile = new File([convertedBlob], file.name.replace(/\.[^/.]+$/, ".png"), { type: "image/png" });
            } catch (e) {
                console.error("Normalization (TIFF) failed:", e);
                return file;
            }
        }

        // 2. Handle EXIF Rotation using a temporary canvas
        const orientation = await getOrientation(processedFile);
        if (orientation > 1) {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return resolve(processedFile);

                    let width = img.width;
                    let height = img.height;

                    // Swap dimensions if 90/270 degrees
                    if (orientation >= 5 && orientation <= 8) {
                        width = img.height;
                        height = img.width;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // Apply transform
                    switch (orientation) {
                        case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
                        case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
                        case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
                        case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
                        case 6: ctx.rotate(90 * Math.PI / 180); ctx.translate(0, -img.height); break;
                        case 7: ctx.transform(0, -1, -1, 0, height, width); break;
                        case 8: ctx.rotate(-90 * Math.PI / 180); ctx.translate(-img.width, 0); break;
                    }

                    ctx.drawImage(img, 0, 0);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(new File([blob], processedFile.name, { type: processedFile.type }));
                        } else {
                            resolve(processedFile);
                        }
                    }, processedFile.type === 'image/png' ? 'image/png' : 'image/jpeg');
                };
                img.src = URL.createObjectURL(processedFile);
            });
        }

        return processedFile;
    };






    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setIsProcessing(true);
        const allNewFiles: FileWithStatus[] = [];

        for (const file of acceptedFiles) {
            // Check for PDF
            if (file.type === 'application/pdf') {
                // ... PDF logic remains ...
                try {
                    const pages = await extractPagesFromPdf(file);
                    allNewFiles.push(...pages);
                } catch (err) {
                    console.error("PDF Extraction error:", err);
                    allNewFiles.push({
                        file,
                        status: "error",
                        originalSize: formatBytes(file.size),
                        errorMessage: "Failed to extract PDF pages"
                    });
                }
            } else {
                // Normalize Image (EXIF + HEIC)
                try {
                    const normalized = await normalizeFile(file);
                    allNewFiles.push({
                        file: normalized,
                        status: "pending",
                        originalSize: formatBytes(normalized.size),
                    });
                } catch (err) {
                    console.error("Normalization failed:", err);
                    allNewFiles.push({
                        file,
                        status: "pending", // Fallback to original
                        originalSize: formatBytes(file.size),
                    });
                }
            }
        }

        setFiles((prev) => [...prev, ...allNewFiles]);
        setIsProcessing(false);
    }, [magickReady]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.heic', '.heif', '.cr2', '.nef', '.arw', '.dng', '.raf', '.orf', '.rw2', '.pef', '.srw', '.tiff', '.tif', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.bmp', '.gif'],
            'application/pdf': ['.pdf']
        },
        multiple: true,
    });


    const processFiles = async () => {
        setIsProcessing(true);
        setProgress(0);

        if (mode === "split") {
            await handleSplitAndDownload();
            setIsProcessing(false);
            return;
        }

        const updatedFiles = [...files];
        let completedCount = 0;

        for (let i = 0; i < updatedFiles.length; i++) {
            const item = updatedFiles[i];
            if (item.status === "done") {
                completedCount++;
                continue;
            }

            item.status = "processing";
            setFiles([...updatedFiles]);

            try {
                let result: Blob | null = null;
                let outputExt = "";

                // Use the unified pipeline for everything to allow chaining
                result = await handleUnifiedPipeline(item.file);

                // Determine output extension based on mode or targetFormat
                // Determine output extension based on mode or targetFormat
                outputExt = targetFormat;

                if (result) {
                    item.result = result;
                    item.status = "done";
                    item.newSize = formatBytes(result.size);
                    const nameParts = item.file.name.split('.');
                    nameParts.pop();
                    item.outputName = `${nameParts.join('.')}_${mode}.${outputExt}`;
                }
            } catch (err: any) {
                console.error("Processing error:", err);
                item.status = "error";
                item.errorMessage = err?.message || "Processing failed";
            }

            completedCount++;
            setProgress((completedCount / updatedFiles.length) * 100);
            setFiles([...updatedFiles]);
        }

        setIsProcessing(false);

        if (downloadMode === "zip") {
            await downloadAllAsZip(updatedFiles);
        } else if (downloadMode === "individual") {
            updatedFiles.forEach(file => {
                if (file.status === "done") {
                    downloadIndividual(file);
                }
            });
        }
    };

    const handleSplitAndDownload = async () => {
        if (files.length === 0 || !files[0].file) return;
        const file = files[0].file;

        try {
            // Create bitmap from the *processed* pipeline result if we want to support chaining? 
            // For now, let's just split the original file or the pipeline result.
            // Using pipeline result allows pre-adjustments before splitting.
            const blob = await handleUnifiedPipeline(file);
            const bitmap = await createImageBitmap(blob);

            const zip = new JSZip();
            const chunkWidth = bitmap.width / splitCols;
            const chunkHeight = bitmap.height / splitRows;

            // Get original extension
            const originalExt = file.name.split('.').pop() || 'jpg';
            const originalName = file.name.split('.')[0];
            const timestamp = Date.now();

            for (let r = 0; r < splitRows; r++) {
                for (let c = 0; c < splitCols; c++) {
                    const canvas = document.createElement('canvas');
                    canvas.width = chunkWidth;
                    canvas.height = chunkHeight;
                    const ctx = canvas.getContext('2d');

                    if (ctx) {
                        ctx.drawImage(
                            bitmap,
                            c * chunkWidth, r * chunkHeight, chunkWidth, chunkHeight,
                            0, 0, chunkWidth, chunkHeight
                        );

                        const blob = await new Promise<Blob | null>(resolve =>
                            canvas.toBlob(resolve, file.type || 'image/png')
                        );

                        if (blob) {
                            const filename = `${originalName}_${r + 1}_${c + 1}.${originalExt}`;
                            zip.file(filename, blob);
                        }
                    }
                }
            }

            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `${originalName}_grid_${splitRows}x${splitCols}_${timestamp}.zip`);

        } catch (error) {
            console.error("Failed to generate split zip", error);
            // Verify if we can show a toast or error status on the file.
            const updatedFiles = [...files];
            updatedFiles[0].status = "error";
            updatedFiles[0].errorMessage = "Split failed";
            setFiles(updatedFiles);
        }
    };

    const handleUnifiedPipeline = async (file: File, isPreview: boolean = false): Promise<Blob> => {
        // Special case for compression which might use a different logic
        if (mode === "compress") {
            const res = await compressToSize(file, targetSizeKB, MagickFormat.Jpg);
            return res.blob;
        }

        // Pre-conversion (HEIC/TIFF) is now handled in onDrop/normalizeFile
        // But we keep this check just in case or for legacy/re-processing
        const processFile = file;

        // EXIF rotation is also handled in normalizeFile, so we can assume orientation 1 for new uploads. 
        // However, if we re-process an old file, we might need it. 
        // Let's rely on the fact that if it's already normalized, getOrientation will return 1.

        // Skip fetching orientation again if we are confident, but it's cheap to check.
        // Actually, if we normalized it, the blob doesn't have EXIF anymore (canvas drops it).
        // So this is safe.

        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(processFile);

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error("Canvas not supported"));
                    return;
                }

                // 1. Calculate Dimensions (Resize + Rotate)
                let width = img.width;
                let height = img.height;

                // EXIF Orientation Check -> Now handled in normalizeFile

                // Handle Resize
                if (!isPreview) {
                    if (resizeMode === "percentage") {
                        width = img.width * (resizePercentage / 100);
                        height = img.height * (resizePercentage / 100);
                    } else if (resizeWidth > 0 && resizeHeight > 0) {
                        width = resizeWidth;
                        height = resizeHeight;
                    }
                }

                // Handle Rotation dimensions (User Rotation Only)
                // If EXIF says 90/270 (5-8), we swap dimensions. 
                // Then if user rotates 90/270, we swap again.
                // BUT, to keep it sane, let's apply EXIF first, drawing to a temp canvas if needed, OR just transform.

                // Easier approach: Handle EXIF in step 4 (Transform).
                // Just need to know if we need to swap dimensions for the final canvas.

                // We rely on the getOrientation result passed in (or we fetch it here). 
                // Since we can't easily async inside onload, let's assume we pre-fetched or fetch now?
                // Actually, handleUnifiedPipeline is async. We can fetch orientation before creating the Image object!

                // Let's assume we pass orientation in or fetches it. 
                // To avoid race conditions, let's fetch it outside and pass it down? 
                // Or just do it here since we are inside the Promise executor but onload is sync.
                // Wait, we can't await inside onload.

                // FIX: Move getOrientation call to BEFORE `new Promise`.

                let sX = 0, sY = 0, sWidth = img.width, sHeight = img.height;
                if (completedCrop && (mode === "crop")) {
                    const previewImg = document.getElementById('crop-target') as HTMLImageElement;
                    if (previewImg) {
                        const scaleX = img.naturalWidth / previewImg.width;
                        const scaleY = img.naturalHeight / previewImg.height;

                        sX = completedCrop.x * scaleX;
                        sY = completedCrop.y * scaleY;
                        sWidth = completedCrop.width * scaleX;
                        sHeight = completedCrop.height * scaleY;

                        canvas.width = sWidth;
                        canvas.height = sHeight;
                    }
                } else {
                    // Calculate bounding box for rotation
                    const rad = (rotateAngle * Math.PI) / 180;
                    const absCos = Math.abs(Math.cos(rad));
                    const absSin = Math.abs(Math.sin(rad));

                    canvas.width = width * absCos + height * absSin;
                    canvas.height = width * absSin + height * absCos;
                }

                // 2. Clear and Save Initial State
                ctx.save();

                // 3. Apply Global Filters (Adjust + Filters)
                applyCanvasFilters(ctx);

                // 4. Transform (Rotate + Flip)
                ctx.translate(canvas.width / 2, canvas.height / 2);

                if (rotateAngle !== 0) {
                    ctx.rotate((rotateAngle * Math.PI) / 180);
                }

                if (mode === "flip" || flipDirection) {
                    const scaleX = flipDirection === "horizontal" ? -1 : 1;
                    const scaleY = flipDirection === "vertical" ? -1 : 1;
                    // Note: only apply flip if we are in flip mode or if we add a global flip state
                    // For now, only apply if mode is "flip" or if we want it global
                    if (mode === "flip") {
                        ctx.scale(scaleX, scaleY);
                    }
                }

                // 5. Draw Image
                // We need to draw centered relative to the transformation
                // The draw size should be the resized dimensions BEFORE rotation
                let drawWidth = img.width;
                let drawHeight = img.height;
                if (!isPreview) {
                    if (resizeMode === "percentage") {
                        drawWidth *= (resizePercentage / 100);
                        drawHeight *= (resizePercentage / 100);
                    } else if (resizeWidth > 0 && resizeHeight > 0) {
                        drawWidth = resizeWidth;
                        drawHeight = resizeHeight;
                    }
                }

                if (mode === "crop" && completedCrop) {
                    // For crop, we need to apply EXIF to the source image drawing too? 
                    // This gets complicated. 
                    // Simplest fix: Pre-process the image if it has EXIF data so `img` is already correct.
                    // But that converts to PNG/Blob, slow.

                    // Alternative: Apply EXIF transform here.
                    ctx.drawImage(img, sX, sY, sWidth, sHeight, 0, 0, sWidth, sHeight);
                } else {
                    // 4b. Apply EXIF Rotation if needed -> Handled in normalizeFile

                    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
                }

                ctx.restore();

                // 6. Apply Watermark Overlay
                applyWatermark(canvas, ctx);

                // 7. Export to Blob
                // 7. Export to Blob
                const outputFormat = targetFormat;
                const needsMagick = ["tiff", "bmp", "pdf", "gif", "avif"].includes(outputFormat);

                if (needsMagick) {
                    canvas.toBlob(async (blob) => {
                        if (!blob) {
                            reject(new Error("Failed to create blob"));
                            return;
                        }

                        // Revoke source URL immediately to free memory
                        URL.revokeObjectURL(url);

                        try {
                            const file = new File([blob], "temp.png", { type: "image/png" });
                            let formatEnum: MagickFormat = MagickFormat.Jpg;
                            switch (outputFormat) {
                                case "tiff": formatEnum = MagickFormat.Tiff; break;
                                case "bmp": formatEnum = MagickFormat.Bmp; break;
                                case "pdf": formatEnum = MagickFormat.Pdf; break;
                                case "gif": formatEnum = MagickFormat.Gif; break;
                                case "avif": formatEnum = MagickFormat.Avif; break;
                            }

                            const magickBlob = await convertFile(file, formatEnum);
                            resolve(magickBlob);
                        } catch (err) {
                            reject(err);
                        }
                    }, 'image/png');
                } else {
                    canvas.toBlob((blob) => {
                        URL.revokeObjectURL(url);
                        if (blob) resolve(blob);
                        else reject(new Error("Failed to create blob"));
                    }, `image/${outputFormat}`, 0.85); // 0.85 quality for JPG/WebP
                }
            };

            img.onerror = (e) => {
                console.error("Image load error details:", e);
                URL.revokeObjectURL(url);
                reject(new Error(`Failed to load image: ${(e as any).type || 'Unknown error'}`));
            };

            img.src = url;
        });
    };

    const handleCrop = async (file: File): Promise<Blob> => {
        return handleUnifiedPipeline(file);
    };

    const applyCanvasFilters = (ctx: CanvasRenderingContext2D) => {
        let filters = [];

        // Adjustments
        if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
        if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
        if (saturation !== 100) filters.push(`saturate(${saturation}%)`);

        // Presets
        switch (selectedFilter) {
            case "grayscale": filters.push("grayscale(100%)"); break;
            case "sepia": filters.push("sepia(100%)"); break;
            case "invert": filters.push("invert(100%)"); break;
            case "warm": filters.push("sepia(30%) saturate(150%) hue-rotate(-10deg)"); break;
            case "cool": filters.push("saturate(120%) hue-rotate(180deg)"); break;
            case "dramatic": filters.push("grayscale(100%) contrast(150%)"); break;
            case "vintage": filters.push("sepia(50%) contrast(80%) brightness(110%)"); break;
        }

        if (filters.length > 0) {
            ctx.filter = filters.join(" ");
        }
    };

    const applyWatermark = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
        ctx.globalAlpha = watermarkOpacity / 100;

        const padding = 20;
        let x = 0;
        let y = 0;

        if (watermarkType === "text" && watermarkText) {
            ctx.font = `bold ${watermarkSize}px Inter, system-ui, sans-serif`;
            ctx.fillStyle = watermarkColor;
            ctx.textBaseline = "middle";

            const metrics = ctx.measureText(watermarkText);
            const w = metrics.width;
            const h = watermarkSize; // Approx

            // Position Logic
            if (watermarkPosition === "top-left") { x = padding; y = padding + h / 2; }
            else if (watermarkPosition === "top-right") { x = canvas.width - w - padding; y = padding + h / 2; }
            else if (watermarkPosition === "bottom-left") { x = padding; y = canvas.height - h / 2 - padding; }
            else if (watermarkPosition === "bottom-right") { x = canvas.width - w - padding; y = canvas.height - h / 2 - padding; }
            else if (watermarkPosition === "center") { x = (canvas.width - w) / 2; y = canvas.height / 2; }

            ctx.fillText(watermarkText, x, y);

        } else if (watermarkType === "image" && watermarkImage) {
            const scale = watermarkSize / 100; // Treat size as percentage scale
            const w = watermarkImage.width * scale;
            const h = watermarkImage.height * scale;

            // Position Logic
            if (watermarkPosition === "top-left") { x = padding; y = padding; }
            else if (watermarkPosition === "top-right") { x = canvas.width - w - padding; y = padding; }
            else if (watermarkPosition === "bottom-left") { x = padding; y = canvas.height - h - padding; }
            else if (watermarkPosition === "bottom-right") { x = canvas.width - w - padding; y = canvas.height - h - padding; }
            else if (watermarkPosition === "center") { x = (canvas.width - w) / 2; y = (canvas.height - h) / 2; }

            ctx.drawImage(watermarkImage, x, y, w, h);
        }

        ctx.globalAlpha = 1.0; // Reset
    };



    const downloadIndividual = (item: FileWithStatus) => {
        if (item.result && item.outputName) {
            // Ensure extension matches
            let finalName = item.outputName;
            const ext = finalName.split('.').pop()?.toLowerCase();
            const expectedExt = targetFormat === 'jpeg' ? 'jpg' : targetFormat;

            // Normalize current extension for comparison
            const currentExt = ext === 'jpeg' ? 'jpg' : ext;

            if (currentExt !== expectedExt) {
                finalName = finalName.replace(/\.[^/.]+$/, "") + "." + expectedExt;
            }

            saveAs(item.result, finalName);
        }
    };



    const downloadAllAsZip = async (currentFiles: FileWithStatus[]) => {
        try {
            const zip = new JSZip();
            let count = 0;

            console.log("Starting ZIP generation for", currentFiles.length, "files");

            currentFiles.forEach((file) => {
                if (file.status === "done" && file.result && file.outputName) {
                    // Sanitize filename & Ensure extension
                    let cleanName = file.outputName.replace(/[^a-zA-Z0-9._-]/g, "_");

                    const ext = cleanName.split('.').pop()?.toLowerCase();
                    const expectedExt = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
                    const currentExt = ext === 'jpeg' ? 'jpg' : ext;

                    if (currentExt !== expectedExt) {
                        cleanName = cleanName.replace(/\.[^/.]+$/, "") + "." + expectedExt;
                    }

                    zip.file(cleanName, file.result);
                    count++;
                }
            });

            if (count === 0) {
                console.warn("No completed files to zip");
                return;
            }

            console.log("Generating ZIP with", count, "files");
            const content = await zip.generateAsync({ type: "blob" });
            saveAs(content, `photocon_${mode}_${Date.now()}.zip`);
        } catch (error) {
            console.error("ZIP Generation failed:", error);
            // Optionally show user alert
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        if (index < selectedFileIndex) {
            setSelectedFileIndex(prev => Math.max(0, prev - 1));
        } else if (index === selectedFileIndex) {
            // If removing selected, stay at index unless it was the last one
            setSelectedFileIndex(prev => (prev === files.length - 1 && prev > 0) ? prev - 1 : prev);
        }
    };


    const isReady = mode === "compress" ? compressorReady : magickReady;

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        if (aspect) {
            setCrop(centerCrop(
                makeAspectCrop(
                    { unit: '%', width: 90 },
                    aspect,
                    width,
                    height
                ),
                width,
                height
            ));
        } else if (mode === "split") {
            // Maybe default split overlay doesn't need crop, but good to know load happened
        } else {
            setCrop({
                unit: '%',
                width: 90,
                height: 90,
                x: 5,
                y: 5
            });
        }
    };

    return (
        <div className="h-full flex flex-col md:flex-row bg-slate-50 overflow-hidden">
            <Tabs value={mode} onValueChange={(v) => setMode(v as ToolMode)} className="flex-1 flex flex-col md:flex-row overflow-hidden" orientation="vertical">
                {/* Sidebar Navigation */}
                <Sidebar currentMode={mode} />

                {/* Main Viewport (Canvas Area) */}
                <CanvasArea
                    previewUrl={previewUrl}
                    mode={mode}
                    isPreviewProcessing={isPreviewProcessing}
                    // Crop Props
                    crop={crop}
                    setCrop={setCrop}
                    setCompletedCrop={setCompletedCrop}
                    aspect={aspect}
                    onImageLoad={onImageLoad}
                    splitRows={splitRows}
                    splitCols={splitCols}
                    // Dropzone
                    getRootProps={getRootProps}
                    getInputProps={getInputProps}
                    isDragActive={isDragActive}
                />
                {/* Right Sidebar (Settings & Queue) */}
                <SettingsPanel
                    currentMode={mode}
                    files={files}
                    setFiles={setFiles}
                    removeFile={removeFile}
                    isProcessing={isProcessing}
                    processFiles={processFiles}
                    isReady={isReady}
                    loadProgress={mode === 'compress' ? compressorProgress : magickProgress}
                    progress={progress}
                    getRootProps={getRootProps}
                    getInputProps={getInputProps}
                    isDragActive={isDragActive}
                    // State
                    targetFormat={targetFormat} setTargetFormat={setTargetFormat}
                    targetSizeKB={targetSizeKB} setTargetSizeKB={setTargetSizeKB}
                    resizeMode={resizeMode} setResizeMode={setResizeMode}
                    resizeWidth={resizeWidth} setResizeWidth={setResizeWidth}
                    resizeHeight={resizeHeight} setResizeHeight={setResizeHeight}
                    resizePercentage={resizePercentage} setResizePercentage={setResizePercentage}
                    rotateAngle={rotateAngle} setRotateAngle={setRotateAngle}
                    flipDirection={flipDirection} setFlipDirection={setFlipDirection}
                    downloadMode={downloadMode} setDownloadMode={setDownloadMode}
                    cropAspectRatio={cropAspectRatio} setCropAspectRatio={setCropAspectRatio}
                    brightness={brightness} setBrightness={setBrightness}
                    contrast={contrast} setContrast={setContrast}
                    saturation={saturation} setSaturation={setSaturation}
                    resetAdjustments={() => {
                        setBrightness(100);
                        setContrast(100);
                        setSaturation(100);
                    }}
                    selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter}
                    watermarkType={watermarkType} setWatermarkType={setWatermarkType}
                    watermarkText={watermarkText} setWatermarkText={setWatermarkText}
                    watermarkImage={watermarkImage} handleWatermarkImageUpload={handleWatermarkImageUpload}
                    watermarkPosition={watermarkPosition} setWatermarkPosition={setWatermarkPosition}
                    watermarkSize={watermarkSize} setWatermarkSize={setWatermarkSize}
                    watermarkOpacity={watermarkOpacity} setWatermarkOpacity={setWatermarkOpacity}
                    splitRows={splitRows} setSplitRows={setSplitRows}
                    splitCols={splitCols} setSplitCols={setSplitCols}
                    selectedFileIndex={selectedFileIndex} setSelectedFileIndex={setSelectedFileIndex}
                />
            </Tabs>
        </div>
    );
}
