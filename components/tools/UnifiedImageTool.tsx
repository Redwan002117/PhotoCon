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
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import {
    Loader2, Upload, Download, Image as ImageIcon, X, CheckCircle2,
    AlertCircle, Package, RefreshCw, Maximize2, RotateCw, FlipHorizontal,
    FileType, Scissors, Sliders, Palette, Type, Wand2
} from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { cardVariants, containerVariants, itemVariants } from "@/lib/animations";

type ToolMode = "convert" | "compress" | "resize" | "crop" | "rotate" | "flip" | "adjust" | "filter" | "watermark";

interface FileWithStatus {
    file: File;
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
    const { isReady: magickReady, convertFile } = useMagick();
    const { isReady: compressorReady, compressToSize } = useImageCompressor();

    const [mode, setMode] = useState<ToolMode>("convert");
    const [files, setFiles] = useState<FileWithStatus[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [downloadMode, setDownloadMode] = useState<"individual" | "zip">("individual");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPreviewProcessing, setIsPreviewProcessing] = useState(false);

    // Convert settings
    const [targetFormat, setTargetFormat] = useState("jpg");

    // Compress settings
    const [targetSizeKB, setTargetSizeKB] = useState(500);
    const [compressFormat, setCompressFormat] = useState("jpg");

    // Resize settings
    const [resizeMode, setResizeMode] = useState<"percentage" | "dimensions">("percentage");
    const [resizePercentage, setResizePercentage] = useState(50);
    const [resizeWidth, setResizeWidth] = useState(800);
    const [resizeHeight, setResizeHeight] = useState(600);

    // Rotate settings
    const [rotateAngle, setRotateAngle] = useState(90);

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
    const [watermarkText, setWatermarkText] = useState("");
    const [watermarkSize, setWatermarkSize] = useState(30);
    const [watermarkColor, setWatermarkColor] = useState("#ffffff");
    const [watermarkOpacity, setWatermarkOpacity] = useState(50);
    const [watermarkPosition, setWatermarkPosition] = useState("bottom-right");

    const updatePreview = useCallback(async () => {
        if (files.length === 0 || !files[0].file) {
            setPreviewUrl(null);
            return;
        }

        setIsPreviewProcessing(true);
        try {
            const blob = await handleUnifiedPipeline(files[0].file);
            const url = URL.createObjectURL(blob);
            setPreviewUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return url;
            });
        } catch (err) {
            console.error("Preview processing error:", err);
        } finally {
            setIsPreviewProcessing(false);
        }
    }, [
        files, mode, targetFormat, targetSizeKB, compressFormat,
        resizeMode, resizePercentage, resizeWidth, resizeHeight,
        rotateAngle, flipDirection, crop, completedCrop,
        brightness, contrast, saturation, selectedFilter,
        watermarkText, watermarkSize, watermarkColor, watermarkOpacity, watermarkPosition
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

                await page.render({
                    canvasContext: context as any,
                    viewport
                }).promise;

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

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setIsProcessing(true);
        const allNewFiles: FileWithStatus[] = [];

        for (const file of acceptedFiles) {
            if (file.type === 'application/pdf') {
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
                allNewFiles.push({
                    file,
                    status: "pending",
                    originalSize: formatBytes(file.size),
                });
            }
        }

        setFiles((prev) => [...prev, ...allNewFiles]);
        setIsProcessing(false);
    }, []);

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
                if (mode === "convert") outputExt = targetFormat;
                else if (mode === "compress") outputExt = compressFormat;
                else outputExt = "png";

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
            await downloadAllAsZip();
        }
    };

    const handleUnifiedPipeline = async (file: File): Promise<Blob> => {
        // Special case for compression which might use a different logic
        if (mode === "compress") {
            const res = await compressToSize(file, targetSizeKB, MagickFormat.Jpg);
            return res.blob;
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

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

                // Handle Resize
                if (resizeMode === "percentage") {
                    width = img.width * (resizePercentage / 100);
                    height = img.height * (resizePercentage / 100);
                } else if (resizeWidth > 0 && resizeHeight > 0) {
                    width = resizeWidth;
                    height = resizeHeight;
                }

                // Handle Rotation dimensions
                if (rotateAngle === 90 || rotateAngle === 270) {
                    [width, height] = [height, width];
                }

                canvas.width = width;
                canvas.height = height;

                // Handle Crop logic (if active)
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
                if (resizeMode === "percentage") {
                    drawWidth *= (resizePercentage / 100);
                    drawHeight *= (resizePercentage / 100);
                } else if (resizeWidth > 0 && resizeHeight > 0) {
                    drawWidth = resizeWidth;
                    drawHeight = resizeHeight;
                }

                if (mode === "crop" && completedCrop) {
                    ctx.drawImage(img, sX, sY, sWidth, sHeight, 0, 0, sWidth, sHeight);
                } else {
                    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
                }

                ctx.restore();

                // 6. Apply Watermark Overlay
                applyWatermark(canvas, ctx);

                // 7. Export to Blob
                const outputFormat = mode === "convert" ? targetFormat : "png";
                canvas.toBlob((blob) => {
                    URL.revokeObjectURL(url);
                    if (blob) resolve(blob);
                    else reject(new Error("Failed to create blob"));
                }, `image/${outputFormat}`);
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("Failed to load image"));
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
        if (!watermarkText) return;

        ctx.font = `bold ${watermarkSize}px Inter, system-ui, sans-serif`;
        ctx.fillStyle = watermarkColor;
        ctx.globalAlpha = watermarkOpacity / 100;
        ctx.textBaseline = "middle";

        const metrics = ctx.measureText(watermarkText);
        const padding = 20;
        let x = 0;
        let y = 0;

        switch (watermarkPosition) {
            case "top-left":
                x = padding;
                y = padding + watermarkSize / 2;
                break;
            case "top-right":
                x = canvas.width - metrics.width - padding;
                y = padding + watermarkSize / 2;
                break;
            case "bottom-left":
                x = padding;
                y = canvas.height - watermarkSize / 2 - padding;
                break;
            case "bottom-right":
                x = canvas.width - metrics.width - padding;
                y = canvas.height - watermarkSize / 2 - padding;
                break;
            case "center":
                x = (canvas.width - metrics.width) / 2;
                y = canvas.height / 2;
                break;
        }

        ctx.fillText(watermarkText, x, y);
        ctx.globalAlpha = 1.0; // Reset
    };

    const handleAdvancedProcessing = async (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error("Canvas not supported"));
                    return;
                }

                canvas.width = img.width;
                canvas.height = img.height;

                // Apply adjustments and filters
                applyCanvasFilters(ctx);

                // Draw image with filters
                ctx.drawImage(img, 0, 0);

                // Apply watermark (unaffected by filters usually)
                applyWatermark(canvas, ctx);

                canvas.toBlob((blob) => {
                    URL.revokeObjectURL(url);
                    if (blob) resolve(blob);
                    else reject(new Error("Failed to create blob"));
                }, 'image/png');
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error("Failed to load image"));
            };

            img.src = url;
        });
    };

    const downloadIndividual = (item: FileWithStatus) => {
        if (item.result && item.outputName) {
            saveAs(item.result, item.outputName);
        }
    };

    const downloadAllIndividually = () => {
        files.forEach((file) => {
            if (file.status === "done") {
                downloadIndividual(file);
            }
        });
    };

    const downloadAllAsZip = async () => {
        const zip = new JSZip();
        let count = 0;

        files.forEach((file) => {
            if (file.status === "done" && file.result && file.outputName) {
                zip.file(file.outputName, file.result);
                count++;
            }
        });

        if (count === 0) return;

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `photocon_${mode}_${Date.now()}.zip`);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const completedCount = files.filter(f => f.status === "done").length;
    const hasCompleted = completedCount > 0;
    const isReady = mode === "compress" ? compressorReady : magickReady;

    return (
        <div className="h-full flex flex-col min-h-0 bg-white">
            <Tabs value={mode} onValueChange={(v) => setMode(v as ToolMode)} className="flex-1 flex flex-col lg:flex-row overflow-hidden" orientation="vertical">
                {/* Sidebar Modes Bar */}
                <TabsList className="flex flex-row lg:flex-col h-14 lg:h-full w-full lg:w-[72px] bg-slate-900 p-2 gap-3 shrink-0 rounded-none border-b lg:border-b-0 lg:border-r overflow-x-auto lg:overflow-y-auto no-scrollbar items-center lg:items-center">
                    {[
                        { value: "convert", icon: FileType, label: "Convert" },
                        { value: "compress", icon: RefreshCw, label: "Compress" },
                        { value: "resize", icon: Maximize2, label: "Resize" },
                        { value: "rotate", icon: RotateCw, label: "Rotate" },
                        { value: "flip", icon: FlipHorizontal, label: "Flip" },
                        { value: "crop", icon: Scissors, label: "Crop" },
                        { value: "adjust", icon: Sliders, label: "Adjust" },
                        { value: "filter", icon: Palette, label: "Filter" },
                        { value: "watermark", icon: Type, label: "Text" },
                    ].map((t) => (
                        <TabsTrigger
                            key={t.value}
                            value={t.value}
                            className="flex flex-col items-center justify-center gap-1.5 w-10 lg:w-full aspect-square p-0 data-[state=active]:bg-primary data-[state=active]:text-white text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all rounded-lg lg:rounded-xl shrink-0"
                            title={t.label}
                        >
                            <t.icon className="w-5 h-5" />
                            <span className="text-[10px] font-bold opacity-80">{t.label}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Main Viewport (Preview Area) */}
                <div className="flex-1 bg-slate-100 flex flex-col min-w-0 border-r-0 lg:border-r relative overflow-hidden min-h-[40vh] lg:min-h-0">
                    <div className="p-3 border-b bg-white/80 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10 shrink-0">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                            <h3 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Live Preview</h3>
                        </div>
                        {isPreviewProcessing && (
                            <div className="flex items-center gap-2 text-[10px] text-primary font-bold animate-pulse">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                UPDATING...
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-hidden p-4 lg:p-8 flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {previewUrl ? (
                                <motion.div
                                    key={previewUrl}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                    className="relative max-w-full max-h-full flex items-center justify-center"
                                >
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="max-w-full max-h-[40vh] lg:max-h-[calc(100vh-200px)] object-contain shadow-2xl rounded-lg bg-white bg-[url('https://www.transparenttextures.com/patterns/checkerboard.png')]"
                                    />
                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-lg border border-slate-200 text-[10px] font-bold text-slate-500 whitespace-nowrap">
                                        <span>PROCESSED PREVIEW</span>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center space-y-4"
                                >
                                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Upload className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium">Upload an image to see live preview</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Right Sidebar (Settings & Queue) */}
                <div className="w-full lg:w-[380px] h-[50vh] lg:h-full flex flex-col min-w-0 bg-white shadow-2xl z-20 overflow-hidden border-t lg:border-t-0 lg:border-l">
                    <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between shrink-0">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-1">Tool Settings</h3>
                        {isReady && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center gap-1.5 text-green-600 text-[10px] font-black bg-green-50 px-2 py-0.5 rounded-full border border-green-100"
                            >
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                READY
                            </motion.div>
                        )}
                        {!isReady && (
                            <div className="flex items-center gap-1.5 text-amber-600 text-[10px] font-black bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                LOADING...
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-8">
                        <TabsContent value="convert" className="mt-0 focus-visible:outline-none">
                            <div className="grid grid-cols-1 gap-5">
                                <div className="space-y-2">
                                    <Label className="font-semibold">Output Format</Label>
                                    <Select value={targetFormat} onValueChange={setTargetFormat} disabled={isProcessing}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="jpg">JPG</SelectItem>
                                            <SelectItem value="png">PNG</SelectItem>
                                            <SelectItem value="webp">WebP</SelectItem>
                                            <SelectItem value="avif">AVIF</SelectItem>
                                            <SelectItem value="tiff">TIFF</SelectItem>
                                            <SelectItem value="bmp">BMP</SelectItem>
                                            <SelectItem value="gif">GIF</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold">Download Mode</Label>
                                    <Select value={downloadMode} onValueChange={(v: any) => setDownloadMode(v)} disabled={isProcessing}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="individual">Individual</SelectItem>
                                            <SelectItem value="zip">ZIP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                                    <Label className="opacity-0">Action</Label>
                                    <Button className="w-full h-11 font-bold shadow-sm" onClick={processFiles} disabled={!isReady || isProcessing || files.length === 0}>
                                        {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Convert All Files
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="compress" className="mt-0 focus-visible:outline-none">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 items-end">
                                <div className="space-y-2">
                                    <Label className="font-semibold">Target Size (KB)</Label>
                                    <Input className="h-11" type="number" value={targetSizeKB} onChange={(e) => setTargetSizeKB(parseInt(e.target.value) || 0)} min={1} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold">Format</Label>
                                    <Select value={compressFormat} onValueChange={setCompressFormat} disabled={isProcessing}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="jpg">JPG</SelectItem>
                                            <SelectItem value="png">PNG</SelectItem>
                                            <SelectItem value="webp">WebP</SelectItem>
                                            <SelectItem value="avif">AVIF</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold">Download Mode</Label>
                                    <Select value={downloadMode} onValueChange={(v: any) => setDownloadMode(v)} disabled={isProcessing}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="individual">Individual</SelectItem>
                                            <SelectItem value="zip">ZIP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                                    <Button className="w-full h-11 font-bold shadow-sm" onClick={processFiles} disabled={!isReady || isProcessing || files.length === 0}>
                                        {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Compress All Files
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="resize" className="mt-0 focus-visible:outline-none">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 items-end">
                                <div className="space-y-2">
                                    <Label className="font-semibold">Mode</Label>
                                    <Select value={resizeMode} onValueChange={(v: any) => setResizeMode(v)} disabled={isProcessing}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage</SelectItem>
                                            <SelectItem value="dimensions">Dimensions</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {resizeMode === "percentage" ? (
                                    <div className="space-y-2">
                                        <Label className="font-semibold">Scale (%)</Label>
                                        <Input className="h-11" type="number" value={resizePercentage} onChange={(e) => setResizePercentage(parseInt(e.target.value) || 0)} min={1} max={500} />
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="font-semibold">Width (px)</Label>
                                            <Input className="h-11" type="number" value={resizeWidth} onChange={(e) => setResizeWidth(parseInt(e.target.value) || 0)} min={1} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-semibold">Height (px)</Label>
                                            <Input className="h-11" type="number" value={resizeHeight} onChange={(e) => setResizeHeight(parseInt(e.target.value) || 0)} min={1} />
                                        </div>
                                    </>
                                )}
                                <div className="space-y-2">
                                    <Label className="font-semibold">Download</Label>
                                    <Select value={downloadMode} onValueChange={(v: any) => setDownloadMode(v)} disabled={isProcessing}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="individual">Individual</SelectItem>
                                            <SelectItem value="zip">ZIP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                                    <Label className="opacity-0">Action</Label>
                                    <Button className="w-full h-11 font-bold shadow-sm" onClick={processFiles} disabled={isProcessing || files.length === 0}>
                                        {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Apply Resize & Process
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="rotate" className="mt-0 focus-visible:outline-none">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 items-end">
                                <div className="space-y-2">
                                    <Label className="font-semibold">Angle (degrees)</Label>
                                    <Select value={rotateAngle.toString()} onValueChange={(v) => setRotateAngle(parseInt(v))} disabled={isProcessing}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="90">90°</SelectItem>
                                            <SelectItem value="180">180°</SelectItem>
                                            <SelectItem value="270">270°</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold">Download Mode</Label>
                                    <Select value={downloadMode} onValueChange={(v: any) => setDownloadMode(v)} disabled={isProcessing}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="individual">Individual</SelectItem>
                                            <SelectItem value="zip">ZIP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 lg:col-span-2">
                                    <Button className="w-full h-11 font-semibold" onClick={processFiles} disabled={isProcessing || files.length === 0}>
                                        {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Rotate
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="flip" className="mt-0 focus-visible:outline-none">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 items-end">
                                <div className="space-y-2">
                                    <Label className="font-semibold">Direction</Label>
                                    <Select value={flipDirection} onValueChange={(v: any) => setFlipDirection(v)} disabled={isProcessing}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="horizontal">Horizontal</SelectItem>
                                            <SelectItem value="vertical">Vertical</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold">Download Mode</Label>
                                    <Select value={downloadMode} onValueChange={(v: any) => setDownloadMode(v)} disabled={isProcessing}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="individual">Individual</SelectItem>
                                            <SelectItem value="zip">ZIP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 lg:col-span-2">
                                    <Button className="w-full h-11 font-semibold" onClick={processFiles} disabled={isProcessing || files.length === 0}>
                                        {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Flip
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="crop" className="mt-0 focus-visible:outline-none">
                            <div className="space-y-6">
                                {files.length > 0 && files[0].file && (
                                    <div className="flex justify-center bg-slate-50 rounded-xl p-4 border border-dashed border-slate-200 min-h-[200px] items-center overflow-hidden">
                                        <ReactCrop
                                            crop={crop}
                                            onChange={c => setCrop(c)}
                                            onComplete={c => setCompletedCrop(c)}
                                            aspect={aspect}
                                            className="max-w-full"
                                        >
                                            <img
                                                id="crop-target"
                                                src={URL.createObjectURL(files[0].file)}
                                                alt="Crop target"
                                                className="max-h-[300px] w-auto object-contain shadow-lg rounded-sm"
                                                onLoad={(e) => {
                                                    const { width, height } = e.currentTarget;
                                                    setCrop(centerCrop(
                                                        makeAspectCrop(
                                                            { unit: '%', width: 90 },
                                                            aspect || 1,
                                                            width,
                                                            height
                                                        ),
                                                        width,
                                                        height
                                                    ));
                                                }}
                                            />
                                        </ReactCrop>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 items-end">
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-slate-700">Aspect Ratio</Label>
                                        <Select value={cropAspectRatio} onValueChange={setCropAspectRatio} disabled={isProcessing}>
                                            <SelectTrigger className="h-11 bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="free">Free Form</SelectItem>
                                                <SelectItem value="1:1">1:1 Square</SelectItem>
                                                <SelectItem value="16:9">16:9 Widescreen</SelectItem>
                                                <SelectItem value="4:3">4:3 Standard</SelectItem>
                                                <SelectItem value="2:3">2:3 Portrait</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-slate-700">Download Mode</Label>
                                        <Select value={downloadMode} onValueChange={(v: any) => setDownloadMode(v)} disabled={isProcessing}>
                                            <SelectTrigger className="h-11 bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="individual">Download Individually</SelectItem>
                                                <SelectItem value="zip">Download All (ZIP)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="lg:col-span-2">
                                        <Button className="w-full h-11 font-semibold shadow-md" onClick={processFiles} disabled={isProcessing || files.length === 0}>
                                            {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                            Apply Crop & Process
                                        </Button>
                                    </div>
                                </div>
                                <p className="text-[11px] text-muted-foreground text-center bg-slate-50 py-2 rounded-md">
                                    Drag handles to crop. This will be applied to all images in your queue.
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="adjust" className="mt-0 focus-visible:outline-none">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 items-end">
                                <div className="space-y-4">
                                    <Label className="font-semibold text-slate-700">Brightness ({brightness}%)</Label>
                                    <Slider value={[brightness]} min={0} max={200} step={1} onValueChange={([v]) => setBrightness(v)} className="py-2" />
                                </div>
                                <div className="space-y-4">
                                    <Label className="font-semibold text-slate-700">Contrast ({contrast}%)</Label>
                                    <Slider value={[contrast]} min={0} max={200} step={1} onValueChange={([v]) => setContrast(v)} className="py-2" />
                                </div>
                                <div className="space-y-4">
                                    <Label className="font-semibold text-slate-700">Saturation ({saturation}%)</Label>
                                    <Slider value={[saturation]} min={0} max={200} step={1} onValueChange={([v]) => setSaturation(v)} className="py-2" />
                                </div>
                                <div className="sm:col-span-2 lg:col-span-2">
                                    <Button className="w-full h-11 font-bold shadow-sm" onClick={processFiles} disabled={isProcessing || files.length === 0}>
                                        {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Apply Adjustments
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="filter" className="mt-0 focus-visible:outline-none">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 items-end">
                                <div className="space-y-2 sm:col-span-1 lg:col-span-2">
                                    <Label className="font-semibold text-slate-700">Preset Filter</Label>
                                    <Select value={selectedFilter} onValueChange={setSelectedFilter} disabled={isProcessing}>
                                        <SelectTrigger className="h-11 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None (Original Image)</SelectItem>
                                            <SelectItem value="grayscale">Grayscale (B&W)</SelectItem>
                                            <SelectItem value="sepia">Sepia (Antique)</SelectItem>
                                            <SelectItem value="invert">Invert (Negative)</SelectItem>
                                            <SelectItem value="warm">Warm Glow</SelectItem>
                                            <SelectItem value="cool">Cool Blue</SelectItem>
                                            <SelectItem value="dramatic">Dramatic B&W</SelectItem>
                                            <SelectItem value="vintage">Vintage Film</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold text-slate-700">Download Mode</Label>
                                    <Select value={downloadMode} onValueChange={(v: any) => setDownloadMode(v)} disabled={isProcessing}>
                                        <SelectTrigger className="h-11 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="individual">Download Individually</SelectItem>
                                            <SelectItem value="zip">Download All (ZIP)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="sm:col-span-2 lg:col-span-2">
                                    <Button className="w-full h-11 font-bold shadow-sm" onClick={processFiles} disabled={isProcessing || files.length === 0}>
                                        {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Apply Filter to All
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="watermark" className="mt-0 focus-visible:outline-none">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 items-end">
                                <div className="space-y-2 lg:col-span-1">
                                    <Label className="font-semibold text-slate-700">Text Content</Label>
                                    <Input
                                        className="h-11 bg-white"
                                        placeholder="Watermark text..."
                                        value={watermarkText}
                                        onChange={(e) => setWatermarkText(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold text-slate-700">Placement</Label>
                                    <Select value={watermarkPosition} onValueChange={setWatermarkPosition}>
                                        <SelectTrigger className="h-11 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="top-left">Top Left</SelectItem>
                                            <SelectItem value="top-right">Top Right</SelectItem>
                                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                            <SelectItem value="center">Center</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-4 px-2">
                                    <Label className="font-semibold text-slate-700 text-xs">Size ({watermarkSize}px)</Label>
                                    <Slider value={[watermarkSize]} min={10} max={200} step={1} onValueChange={([v]) => setWatermarkSize(v)} />
                                </div>
                                <div className="space-y-4 px-2">
                                    <Label className="font-semibold text-slate-700 text-xs">Opacity ({watermarkOpacity}%)</Label>
                                    <Slider value={[watermarkOpacity]} min={0} max={100} step={1} onValueChange={([v]) => setWatermarkOpacity(v)} />
                                </div>
                                <div className="sm:col-span-2 lg:col-span-2">
                                    <Button className="w-full h-11 font-bold shadow-sm" onClick={processFiles} disabled={isProcessing || files.length === 0}>
                                        {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                        Add Watermark & Process
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Upload Zone (Integrated into Settings) */}
                        <div className="pt-4 border-t border-slate-100">
                            <div
                                {...getRootProps()}
                                className={`
                                    border-2 border-dashed rounded-xl p-6 sm:p-12 text-center cursor-pointer transition-all
                                    ${isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50"}
                                `}
                            >
                                <input {...getInputProps()} />
                                <div className="flex flex-col items-center gap-3 sm:gap-4">
                                    <div className="p-3 sm:p-4 bg-muted rounded-full">
                                        <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-semibold">Drop images here or click to browse</h3>
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                                            Supports: <span className="font-medium">HEIC, RAW, TIFF, PNG, JPG, WebP</span> and more
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* File Queue (Integrated into Settings) */}
                        {files.length > 0 && (
                            <div className="pt-4 border-t border-slate-100">
                                <Card variant="glass" className="border-slate-200">
                                    <CardHeader className="py-4">
                                        <CardTitle className="flex items-center justify-between text-sm">
                                            <span className="font-bold text-slate-700">Queue ({files.length})</span>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold tracking-wider" onClick={() => setFiles([])} disabled={isProcessing}>
                                                    Clear All
                                                </Button>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 p-3">
                                        {isProcessing && (
                                            <div className="mb-4 px-1">
                                                <Progress value={progress} className="h-1" />
                                            </div>
                                        )}
                                        {files.map((item, index) => (
                                            <div key={index} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-lg group">
                                                <div className="flex items-center gap-3 overflow-hidden flex-1">
                                                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center shrink-0 shadow-sm">
                                                        <ImageIcon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-bold text-[11px] text-slate-700 truncate">{item.file.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">
                                                            {item.originalSize}
                                                            {item.newSize && <span className="text-green-600 ml-1.5">→ {item.newSize}</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {item.status === 'processing' && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                                                    {item.status === 'done' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                                                    {item.status === 'pending' && <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-300 hover:text-red-500" onClick={() => removeFile(index)}><X className="w-3.5 h-3.5" /></Button>}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </Tabs>
        </div>
    );
}
