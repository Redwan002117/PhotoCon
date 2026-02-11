'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';
import { Button } from '@/components/ui/button';
import {
    UploadCloud,
    Image as ImageIcon,
    X,
    Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessedFile {
    original: File;
    status: 'pending' | 'processing' | 'done' | 'error';
    blob?: Blob;
    newName?: string;
    errorMsg?: string;
}

export const BulkResizer = () => {
    const [files, setFiles] = useState<ProcessedFile[]>([]);
    const [width, setWidth] = useState<number | ''>('');
    const [height, setHeight] = useState<number | ''>('');
    const [percentage, setPercentage] = useState<number>(100);
    const [mode, setMode] = useState<'dimensions' | 'percentage'>('percentage');
    const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
    const [quality, setQuality] = useState<number>(0.8);
    const [isProcessing, setIsProcessing] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map(f => ({
            original: f,
            status: 'pending' as const
        }));
        setFiles(prev => [...prev, ...newFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.heic', '.heif']
        }
    });

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const processImages = async () => {
        setIsProcessing(true);
        const zip = new JSZip();

        const processSingle = async (item: ProcessedFile, index: number) => {
            setFiles(prev => {
                const newArr = [...prev];
                newArr[index].status = 'processing';
                return newArr;
            });

            try {
                let imgSource: Blob | string = item.original;

                // Handle HEIC
                if (item.original.name.toLowerCase().endsWith('.heic') || item.original.type === 'image/heic') {
                    // Dynamic import to avoid SSR issues
                    const heic2any = (await import('heic2any')).default;
                    const converted = await heic2any({
                        blob: item.original,
                        toType: "image/jpeg",
                        quality: 0.9
                    });
                    // heic2any can return Blob or Blob[]
                    imgSource = Array.isArray(converted) ? converted[0] : converted;
                }

                // Load Image
                const img = new Image();
                const url = URL.createObjectURL(imgSource instanceof Blob ? imgSource : item.original);

                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = url;
                });

                // Calculate Dimensions
                let targetWidth = img.naturalWidth;
                let targetHeight = img.naturalHeight;

                if (mode === 'percentage') {
                    const scale = percentage / 100;
                    targetWidth = Math.round(img.naturalWidth * scale);
                    targetHeight = Math.round(img.naturalHeight * scale);
                } else if (mode === 'dimensions') {
                    if (width && !height) {
                        const ratio = width / img.naturalWidth;
                        targetWidth = Number(width);
                        targetHeight = Math.round(img.naturalHeight * ratio);
                    } else if (height && !width) {
                        const ratio = Number(height) / img.naturalHeight;
                        targetHeight = Number(height);
                        targetWidth = Math.round(img.naturalWidth * ratio);
                    } else if (width && height) {
                        targetWidth = Number(width);
                        targetHeight = Number(height);
                    }
                }

                // Draw to Canvas
                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');

                if (!ctx) throw new Error("Canvas context failed");
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                // Export
                const blob = await new Promise<Blob | null>(resolve =>
                    canvas.toBlob(resolve, format, quality)
                );

                if (!blob) throw new Error("Export failed");

                URL.revokeObjectURL(url);

                // Extension logic: Prefer .jpg over .jpeg
                let ext = format.split('/')[1];
                if (ext === 'jpeg') ext = 'jpg';

                const newName = `${item.original.name.split('.')[0]}_resized.${ext}`;
                zip.file(newName, blob);

                setFiles(prev => {
                    const newArr = [...prev];
                    newArr[index].status = 'done';
                    newArr[index].blob = blob;
                    newArr[index].newName = newName;
                    return newArr;
                });

            } catch (err: any) {
                console.error(err);
                setFiles(prev => {
                    const newArr = [...prev];
                    newArr[index].status = 'error';
                    newArr[index].errorMsg = err.message || "Failed";
                    return newArr;
                });
            }
        };

        // Sequential processing to avoid memory spikes with large HEIC files
        for (let i = 0; i < files.length; i++) {
            await processSingle(files[i], i);
        }

        // Generate Zip if any success
        const hasSuccess = files.some(f => f.status === 'done');
        if (hasSuccess) {
            const content = await zip.generateAsync({ type: "blob" });
            const zipUrl = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = zipUrl;
            link.download = "resized_images.zip";
            link.click();
        }

        setIsProcessing(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Settings */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
                <h3 className="font-semibold mb-6 flex items-center gap-2 text-slate-800">
                    <Settings2 className="w-5 h-5 text-blue-600" /> Image Settings
                </h3>

                <div className="space-y-6">
                    {/* Mode Toggle */}
                    <div className="flex bg-slate-100 p-1.5 rounded-xl">
                        <button
                            className={cn("flex-1 py-2 text-sm font-medium rounded-lg transition-all", mode === 'percentage' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                            onClick={() => setMode('percentage')}
                        >
                            Scale %
                        </button>
                        <button
                            className={cn("flex-1 py-2 text-sm font-medium rounded-lg transition-all", mode === 'dimensions' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                            onClick={() => setMode('dimensions')}
                        >
                            Px Dimensions
                        </button>
                    </div>

                    {/* Inputs */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {mode === 'percentage' ? (
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-slate-700">Scale Factor</label>
                                    <span className="text-sm font-bold text-blue-600">{percentage}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="10" max="200" step="5"
                                    value={percentage}
                                    onChange={(e) => setPercentage(Number(e.target.value))}
                                    className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Width</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="Auto"
                                            value={width}
                                            onChange={(e) => setWidth(e.target.value ? Number(e.target.value) : '')}
                                            className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        />
                                        <span className="absolute right-3 top-2.5 text-xs text-slate-400">px</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase text-slate-500 mb-1 block">Height</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="Auto"
                                            value={height}
                                            onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                                            className="w-full p-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        />
                                        <span className="absolute right-3 top-2.5 text-xs text-slate-400">px</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {/* Format */}
                        <div>
                            <label className="text-sm font-medium mb-2 block text-slate-700">Output Format</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['image/jpeg', 'image/png', 'image/webp'].map((fmt) => (
                                    <button
                                        key={fmt}
                                        onClick={() => setFormat(fmt as any)}
                                        className={cn(
                                            "py-2 text-sm border rounded-lg transition-all",
                                            format === fmt
                                                ? "border-blue-500 bg-blue-50 text-blue-700 font-medium ring-1 ring-blue-500"
                                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                        )}
                                    >
                                        {fmt.split('/')[1].replace('jpeg', 'jpg').toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quality */}
                        {(format === 'image/jpeg' || format === 'image/webp') && (
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-slate-700">Quality</label>
                                    <span className="text-sm text-slate-500">{Math.round(quality * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0.1" max="1.0" step="0.1"
                                    value={quality}
                                    onChange={(e) => setQuality(Number(e.target.value))}
                                    className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        )}
                    </div>

                    <Button
                        className="w-full h-12 text-lg font-medium shadow-md shadow-blue-500/20"
                        disabled={files.length === 0 || isProcessing}
                        onClick={processImages}
                    >
                        {isProcessing ? "Processing..." : `Resize ${files.length} Images`}
                    </Button>
                </div>
            </div>

            {/* Right: Upload & List */}
            <div className="lg:col-span-2 space-y-6">
                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed rounded-2xl h-40 flex flex-col items-center justify-center cursor-pointer transition-all duration-200",
                        isDragActive ? "border-blue-500 bg-blue-50 scale-[1.02]" : "border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100"
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                        <UploadCloud className="w-6 h-6 text-blue-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">Click to upload or drag & drop</p>
                    <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WebP, HEIC</p>
                </div>

                <div className="space-y-3">
                    {files.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 border border-slate-200">
                                    <ImageIcon className="w-6 h-6 text-slate-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate" title={file.original.name}>{file.original.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-xs text-slate-500">{(file.original.size / 1024).toFixed(0)} KB</p>
                                        {file.newName && <span className="text-xs text-blue-600 bg-blue-50 px-1.5 rounded">→ {file.newName}</span>}
                                    </div>
                                    {file.errorMsg && <p className="text-xs text-red-500 mt-1">{file.errorMsg}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className={cn(
                                    "text-xs px-2.5 py-1 rounded-full font-medium capitalize",
                                    file.status === 'done' ? "bg-green-100 text-green-700" :
                                        file.status === 'error' ? "bg-red-100 text-red-700" :
                                            file.status === 'processing' ? "bg-blue-100 text-blue-700 animate-pulse" :
                                                "bg-slate-100 text-slate-600"
                                )}>
                                    {file.status}
                                </span>
                                <button onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {files.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                            <ImageIcon className="w-10 h-10 mb-3 opacity-20" />
                            <p className="text-sm">No images added yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
