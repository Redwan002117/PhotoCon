"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMagick, MagickFormat } from "@/hooks/useMagick";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Download, Image as ImageIcon, X, CheckCircle2, AlertCircle, Package } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Progress } from "@/components/ui/progress";

interface FileWithStatus {
    file: File;
    status: "pending" | "converting" | "done" | "error";
    convertedBlob?: Blob;
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
}

export default function UniversalConverter() {
    const { isReady, error: magickError, convertFile } = useMagick();
    const [files, setFiles] = useState<FileWithStatus[]>([]);
    const [targetFormat, setTargetFormat] = useState<string>("jpg");
    const [downloadMode, setDownloadMode] = useState<"individual" | "zip">("individual");
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map((file) => ({
            file,
            status: "pending" as const,
            originalSize: formatBytes(file.size),
        }));
        setFiles((prev) => [...prev, ...newFiles]);
    }, []);

    // Accept ALL files - explicitly list common formats to show in file picker
    // but don't restrict what can be dropped
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.heic', '.heif', '.cr2', '.nef', '.arw', '.dng', '.raf', '.orf', '.rw2', '.pef', '.srw', '.tiff', '.tif', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.bmp', '.gif'],
            'application/pdf': ['.pdf']
        },
        multiple: true,
        noClick: false,
        noKeyboard: false
    });

    const handleConvertAll = async () => {
        if (!isReady) return;
        setIsProcessing(true);
        setProgress(0);

        // Map string format to MagickFormat enum
        let formatEnum: MagickFormat = MagickFormat.Jpg;
        switch (targetFormat) {
            case "png": formatEnum = MagickFormat.Png; break;
            case "webp": formatEnum = MagickFormat.WebP; break;
            case "avif": formatEnum = MagickFormat.Avif; break;
            case "bmp": formatEnum = MagickFormat.Bmp; break;
            case "tiff": formatEnum = MagickFormat.Tiff; break;
            case "pdf": formatEnum = MagickFormat.Pdf; break;
            case "gif": formatEnum = MagickFormat.Gif; break;
        }

        const updatedFiles = [...files];
        let completedCount = 0;

        for (let i = 0; i < updatedFiles.length; i++) {
            const item = updatedFiles[i];
            if (item.status === "done") {
                completedCount++;
                continue;
            }

            item.status = "converting";
            setFiles([...updatedFiles]);

            try {
                const blob = await convertFile(item.file, formatEnum);
                item.convertedBlob = blob;
                item.status = "done";
                item.newSize = formatBytes(blob.size);

                // Generate new name
                const nameParts = item.file.name.split('.');
                nameParts.pop(); // remove extension
                item.outputName = `${nameParts.join('.')}.${targetFormat}`;

            } catch (err: any) {
                console.error("Conversion error:", err);
                item.status = "error";
                item.errorMessage = err?.message || "Conversion failed";
            }

            completedCount++;
            setProgress((completedCount / updatedFiles.length) * 100);
            setFiles([...updatedFiles]);
        }

        setIsProcessing(false);

        // Auto-download based on mode
        if (downloadMode === "zip") {
            await downloadAllAsZip();
        }
    };

    const downloadAllAsZip = async () => {
        const zip = new JSZip();
        let count = 0;

        files.forEach((file) => {
            if (file.status === "done" && file.convertedBlob && file.outputName) {
                zip.file(file.outputName, file.convertedBlob);
                count++;
            }
        });

        if (count === 0) return;

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `converted_images_${Date.now()}.zip`);
    };

    const downloadIndividual = (item: FileWithStatus) => {
        if (item.convertedBlob && item.outputName) {
            saveAs(item.convertedBlob, item.outputName);
        }
    };

    const downloadAllIndividually = () => {
        files.forEach((file) => {
            if (file.status === "done") {
                downloadIndividual(file);
            }
        });
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const completedCount = files.filter(f => f.status === "done").length;
    const hasCompleted = completedCount > 0;

    if (magickError) {
        return (
            <div className="text-red-500 font-bold p-4 border border-red-200 rounded-lg bg-red-50">
                <AlertCircle className="w-5 h-5 inline mr-2" />
                {magickError}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Settings Card */}
            <Card variant="elevated">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Conversion Settings</span>
                        {isReady && (
                            <div className="flex items-center gap-2 text-green-600 text-sm font-normal">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                WASM Ready
                            </div>
                        )}
                        {!isReady && (
                            <div className="flex items-center gap-2 text-amber-600 text-sm font-normal">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Loading...
                            </div>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                                    <SelectItem value="pdf">PDF (Document)</SelectItem>
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
                                    <SelectItem value="individual">Individual Files</SelectItem>
                                    <SelectItem value="zip">Batch (ZIP)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="opacity-0">Actions</Label>
                            <Button
                                className="w-full h-11 font-semibold"
                                onClick={handleConvertAll}
                                disabled={!isReady || isProcessing || files.length === 0}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Converting...
                                    </>
                                ) : (
                                    `Convert ${files.length > 0 ? `(${files.length})` : 'All'}`
                                )}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Upload Zone */}
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
                            Supports: <span className="font-medium">HEIC, RAW (CR2, NEF, ARW), TIFF, PNG, JPG, WebP</span> and more
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            All processing happens locally in your browser - 100% private
                        </p>
                    </div>
                </div>
            </div>

            {/* File Queue */}
            {files.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Queue ({files.length} files)</span>
                            <div className="flex gap-2">
                                {hasCompleted && downloadMode === "individual" && (
                                    <Button variant="outline" size="sm" onClick={downloadAllIndividually}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Download All
                                    </Button>
                                )}
                                {hasCompleted && downloadMode === "zip" && (
                                    <Button variant="outline" size="sm" onClick={downloadAllAsZip}>
                                        <Package className="w-4 h-4 mr-2" />
                                        Download ZIP
                                    </Button>
                                )}
                                <Button variant="ghost" size="sm" onClick={() => setFiles([])} disabled={isProcessing}>
                                    Clear All
                                </Button>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isProcessing && (
                            <div className="mb-4">
                                <Progress value={progress} className="h-2" />
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                    {completedCount} of {files.length} completed
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            {files.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-muted/30 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden flex-1">
                                        <div className="w-10 h-10 bg-background rounded flex items-center justify-center shrink-0">
                                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-sm truncate">{item.file.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.originalSize}
                                                {item.newSize && (
                                                    <span className="text-green-600 font-medium ml-2">
                                                        → {item.newSize}
                                                    </span>
                                                )}
                                                {item.errorMessage && (
                                                    <span className="text-red-500 font-medium ml-2">
                                                        {item.errorMessage}
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        {item.status === 'converting' && (
                                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                        )}
                                        {item.status === 'done' && (
                                            <>
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                {downloadMode === "individual" && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8"
                                                        onClick={() => downloadIndividual(item)}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                        {item.status === 'error' && (
                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                        )}
                                        {item.status === 'pending' && !isProcessing && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 hover:text-destructive"
                                                onClick={() => removeFile(index)}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
