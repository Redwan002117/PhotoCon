"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useImageCompressor, CompressionResult } from "@/hooks/useImageCompressor";
import { MagickFormat } from "@/hooks/useMagick";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, Download, ArrowRight, FileImage, RefreshCw } from "lucide-react";
import { saveAs } from "file-saver";

interface CompressedFile extends CompressionResult {
    originalFile: File;
    name: string;
}

const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function ImageCompressor() {
    const { isReady, compressToSize, error } = useImageCompressor();
    const [file, setFile] = useState<File | null>(null);
    const [targetSizeKB, setTargetSizeKB] = useState<number>(500); // Default 500KB
    const [targetFormat, setTargetFormat] = useState<string>("jpg");
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<CompressedFile | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setResult(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1
    });

    const handleCompress = async () => {
        if (!file || !isReady) return;
        setIsProcessing(true);
        setResult(null);

        try {
            let formatEnum: MagickFormat = MagickFormat.Jpg;
            switch (targetFormat) {
                case "png": formatEnum = MagickFormat.Png; break;
                case "webp": formatEnum = MagickFormat.WebP; break;
                case "avif": formatEnum = MagickFormat.Avif; break;
            }

            const res = await compressToSize(file, targetSizeKB, formatEnum);

            setResult({
                ...res,
                originalFile: file,
                name: `compressed_${file.name.split('.')[0]}.${targetFormat}`
            });

        } catch (err) {
            console.error(err);
            alert("Compression failed: " + err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (result) {
            saveAs(result.blob, result.name);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Source Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            {...getRootProps()}
                            className={`
                        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all h-64 flex flex-col items-center justify-center
                        ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}
                    `}
                        >
                            <input {...getInputProps()} />
                            {file ? (
                                <div className="space-y-2">
                                    <FileImage className="w-12 h-12 text-primary mx-auto" />
                                    <p className="font-medium text-lg truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-muted-foreground">{formatBytes(file.size)}</p>
                                    <Button variant="ghost" size="sm" onClick={(e: React.MouseEvent) => { e.stopPropagation(); setFile(null); setResult(null); }}>
                                        Change File
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-4 bg-muted rounded-full">
                                        <Upload className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">Drop image here</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            JPG, PNG, WebP up to 10MB
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Compression Targets</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Output Format</Label>
                            <Select value={targetFormat} onValueChange={setTargetFormat}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="jpg">JPG (Best Compatibility)</SelectItem>
                                    <SelectItem value="webp">WebP (Modern & Small)</SelectItem>
                                    <SelectItem value="avif">AVIF (Ultra Small)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Target File Size (KB)</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    value={targetSizeKB}
                                    onChange={(e) => setTargetSizeKB(parseInt(e.target.value) || 0)}
                                    min={10}
                                />
                                <div className="flex items-center text-sm text-muted-foreground shrink-0 w-16">
                                    KB
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Engine will adjust quality to try and meet this size.
                            </p>
                        </div>

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleCompress}
                            disabled={!file || !isReady || isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Optimizing...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Compress Now
                                </>
                            )}
                        </Button>
                        {!isReady && <p className="text-xs text-center text-amber-600">Loading WASM engine...</p>}
                    </CardContent>
                </Card>
            </div>

            {/* Result Section */}
            <div className="space-y-6">
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Result</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
                        {result ? (
                            <div className="w-full space-y-6 text-center animate-in fade-in zoom-in duration-300">
                                <div className="p-6 bg-green-50 rounded-2xl border border-green-200 inline-block">
                                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mb-2">New Size</p>
                                    <p className="text-5xl font-bold text-green-600 tracking-tight">
                                        {formatBytes(result.size)}
                                    </p>
                                    <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                                        <span className="line-through text-muted-foreground decoration-red-500">
                                            {formatBytes(result.originalFile.size)}
                                        </span>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-green-700 font-bold">
                                            -{Math.round((1 - result.size / result.originalFile.size) * 100)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground max-w-xs mx-auto">
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <span className="block font-medium text-slate-900">Quality Used</span>
                                        {result.quality}%
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-lg">
                                        <span className="block font-medium text-slate-900">Iterations</span>
                                        {result.iterations}
                                    </div>
                                </div>

                                <Button size="lg" className="w-full max-w-sm h-12 text-lg" onClick={handleDownload}>
                                    <Download className="w-5 h-5 mr-2" />
                                    Download Compressed
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ArrowRight className="w-8 h-8 text-slate-300" />
                                </div>
                                <p>Compressed output will appear here</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
