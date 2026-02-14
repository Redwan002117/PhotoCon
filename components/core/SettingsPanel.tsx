import {
    Loader2, Upload, X, CheckCircle2, Image as ImageIcon,
    RefreshCw, Maximize2, RotateCw, FlipHorizontal,
    FileType, Scissors, Sliders, Palette, Type, CheckCircle, Grid3X3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropzoneRootProps, DropzoneInputProps } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface SettingsPanelProps {
    currentMode: string;
    files: any[];
    setFiles: (files: any[]) => void;
    removeFile: (index: number) => void;
    isProcessing: boolean;
    processFiles: () => void;
    isReady: boolean;
    loadProgress?: number;
    progress: number;
    // Dropzone
    getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
    getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
    isDragActive: boolean;
    // Settings State
    targetFormat: string;
    setTargetFormat: (v: string) => void;
    targetSizeKB: number;
    setTargetSizeKB: (v: number) => void;
    resizeMode: "percentage" | "dimensions";
    setResizeMode: (v: "percentage" | "dimensions") => void;
    resizeWidth: number;
    setResizeWidth: (v: number) => void;
    resizeHeight: number;
    setResizeHeight: (v: number) => void;
    resizePercentage: number;
    setResizePercentage: (v: number) => void;
    rotateAngle: number;
    setRotateAngle: (v: number) => void;
    flipDirection: "horizontal" | "vertical";
    setFlipDirection: (v: "horizontal" | "vertical") => void;
    downloadMode: "individual" | "zip";
    setDownloadMode: (v: "individual" | "zip") => void;
    // Crop
    cropAspectRatio: string;
    setCropAspectRatio: (v: string) => void;
    // Adjust
    brightness: number;
    setBrightness: (v: number) => void;
    contrast: number;
    setContrast: (v: number) => void;
    saturation: number;
    setSaturation: (v: number) => void;
    resetAdjustments: () => void;
    // Filter
    selectedFilter: string;
    setSelectedFilter: (v: string) => void;
    // Watermark
    watermarkType: "text" | "image";
    setWatermarkType: (v: "text" | "image") => void;
    watermarkText: string;
    setWatermarkText: (v: string) => void;
    watermarkImage: HTMLImageElement | null;
    handleWatermarkImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    watermarkPosition: string;
    setWatermarkPosition: (v: string) => void;
    watermarkSize: number;
    setWatermarkSize: (v: number) => void;
    watermarkOpacity: number;
    setWatermarkOpacity: (v: number) => void;
    // Split
    splitRows: number;
    setSplitRows: (v: number) => void;
    splitCols: number;
    setSplitCols: (v: number) => void;
    // Queue Selection
    selectedFileIndex: number;
    setSelectedFileIndex: (v: number) => void;
}

export const SettingsPanel = ({
    currentMode,
    files, setFiles, removeFile, isProcessing, processFiles, isReady, loadProgress = 0, progress,
    getRootProps, getInputProps, isDragActive,
    targetFormat, setTargetFormat,
    targetSizeKB, setTargetSizeKB,
    resizeMode, setResizeMode, resizeWidth, setResizeWidth, resizeHeight, setResizeHeight, resizePercentage, setResizePercentage,
    rotateAngle, setRotateAngle,
    flipDirection, setFlipDirection,
    downloadMode, setDownloadMode,
    cropAspectRatio, setCropAspectRatio,
    brightness, setBrightness, contrast, setContrast, saturation, setSaturation, resetAdjustments,
    selectedFilter, setSelectedFilter,
    watermarkType, setWatermarkType, watermarkText, setWatermarkText, watermarkImage, handleWatermarkImageUpload, watermarkPosition, setWatermarkPosition, watermarkSize, setWatermarkSize, watermarkOpacity, setWatermarkOpacity,
    splitRows, setSplitRows, splitCols, setSplitCols,
    selectedFileIndex, setSelectedFileIndex
}: SettingsPanelProps) => {

    // Queue State
    const [isQueueOpen, setIsQueueOpen] = useState(true);

    // Tool icon mapping
    const toolIcons: Record<string, { icon: any; label: string }> = {
        convert: { icon: FileType, label: "Convert" },
        compress: { icon: RefreshCw, label: "Compress" },
        resize: { icon: Maximize2, label: "Resize" },
        rotate: { icon: RotateCw, label: "Rotate" },
        flip: { icon: FlipHorizontal, label: "Flip" },
        crop: { icon: Scissors, label: "Crop" },
        adjust: { icon: Sliders, label: "Adjust" },
        filter: { icon: Palette, label: "Filter" },
        watermark: { icon: Type, label: "Watermark" },
        split: { icon: Grid3X3, label: "Split" },
    };

    const currentTool = toolIcons[currentMode] || { icon: FileType, label: "Configuration" };

    return (
        <div className="w-full md:w-[300px] lg:w-[320px] flex flex-col gap-3 p-3 md:p-0 bg-transparent z-20 overflow-y-auto custom-scrollbar max-h-full">
            {/* Configuration Panel */}
            <div className="flex flex-col bg-zinc-50/90 backdrop-blur-2xl shadow-2xl overflow-hidden rounded-2xl md:rounded-none md:rounded-l-2xl border border-white/20 ring-1 ring-black/5">
                {/* Header */}
                <div className="p-3 border-b border-zinc-200/50 flex items-center justify-between shrink-0 bg-white/40 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <currentTool.icon className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-zinc-800 tracking-tight text-lg">{currentTool.label}</h3>
                    </div>
                    {isReady ? (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 shadow-sm">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                            READY
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            {loadProgress > 0 ? `LOADING ${loadProgress}%` : 'LOADING...'}
                        </span>
                    )}
                </div>

                {/* Settings Area */}
                <div className="overflow-y-auto p-4 space-y-5 custom-scrollbar">
                    {/* GLOBAL EXPORT SETTINGS */}
                    <div className="p-4 bg-white/60 rounded-2xl border border-zinc-100 space-y-4 shadow-sm">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Export Settings</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-zinc-600">Format</Label>
                                <Select value={targetFormat} onValueChange={setTargetFormat} disabled={isProcessing}>
                                    <SelectTrigger className="h-9 bg-white border-zinc-200 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="jpg">JPG</SelectItem>
                                        <SelectItem value="png">PNG</SelectItem>
                                        <SelectItem value="webp">WebP</SelectItem>
                                        <SelectItem value="avif">AVIF</SelectItem>
                                        <SelectItem value="tiff">TIFF</SelectItem>
                                        <SelectItem value="pdf">PDF</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-zinc-600">Mode</Label>
                                <Select value={downloadMode} onValueChange={(v) => setDownloadMode(v as "individual" | "zip")} disabled={isProcessing}>
                                    <SelectTrigger className="h-9 bg-white border-zinc-200 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="individual">Files</SelectItem>
                                        <SelectItem value="zip">ZIP</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* CONVERT */}
                    <TabsContent value="convert" className="mt-0 focus-visible:outline-none">
                        <div className="grid grid-cols-1 gap-4">




                            <div className="pt-2">
                                <Button
                                    className="w-full h-10 font-bold shadow-lg shadow-indigo-500/20 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-500/30 transition-all duration-300 rounded-xl"
                                    onClick={processFiles}
                                    disabled={isProcessing || files.length === 0}
                                >
                                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Convert Images
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* COMPRESS */}
                    <TabsContent value="compress" className="mt-0 focus-visible:outline-none">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700">Max Size (KB)</Label>
                                <Input
                                    type="number"
                                    className="h-11 bg-white/50 border-slate-200 focus:ring-blue-500/20 rounded-xl"
                                    value={targetSizeKB}
                                    onChange={(e) => setTargetSizeKB(parseInt(e.target.value) || 500)}
                                    min={10}
                                />
                                <p className="text-[11px] text-muted-foreground">Example: 500 = 0.5MB</p>
                            </div>



                            <div className="pt-2">
                                <Button
                                    className="w-full h-12 font-bold shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/30 transition-all duration-300 rounded-xl"
                                    onClick={processFiles} disabled={isProcessing || files.length === 0}>
                                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Compress Images
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* RESIZE */}
                    <TabsContent value="resize" className="mt-0 focus-visible:outline-none">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700">Mode</Label>
                                <Select value={resizeMode} onValueChange={(v) => setResizeMode(v as "percentage" | "dimensions")} disabled={isProcessing}>
                                    <SelectTrigger className="h-11 bg-white/50 border-slate-200 focus:ring-blue-500/20 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage</SelectItem>
                                        <SelectItem value="dimensions">Dimensions</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {resizeMode === 'percentage' ? (
                                <div className="space-y-2">
                                    <Label className="font-semibold text-slate-700">Scale (%)</Label>
                                    <Input
                                        type="number"
                                        className="h-11 bg-white/50 border-slate-200 focus:ring-blue-500/20 rounded-xl"
                                        value={resizePercentage}
                                        onChange={(e) => setResizePercentage(Number(e.target.value))}
                                        min={1} max={500}
                                    />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-slate-700">Width (px)</Label>
                                        <Input
                                            type="number"
                                            className="h-11 bg-white/50 border-slate-200 focus:ring-blue-500/20 rounded-xl"
                                            value={resizeWidth}
                                            onChange={(e) => setResizeWidth(Number(e.target.value))}
                                            min={1}
                                            placeholder="Width"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-slate-700">Height (px)</Label>
                                        <Input
                                            type="number"
                                            className="h-9 bg-white/50 border-slate-200 focus:ring-blue-500/20 rounded-xl"
                                            value={resizeHeight}
                                            onChange={(e) => setResizeHeight(Number(e.target.value))}
                                            min={1}
                                            placeholder="Height"
                                        />
                                    </div>
                                </div>
                            )}



                            <div className="pt-2">
                                <Button
                                    className="w-full h-12 font-bold shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/30 transition-all duration-300 rounded-xl"
                                    onClick={processFiles} disabled={isProcessing || files.length === 0}
                                >
                                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Resize Images
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* ROTATE */}
                    <TabsContent value="rotate" className="mt-0 focus-visible:outline-none">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700">Angle (degrees)</Label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <Slider
                                            value={[rotateAngle]}
                                            onValueChange={(v) => setRotateAngle(v[0])}
                                            min={0}
                                            max={360}
                                            step={1}
                                            className="py-4"
                                        />
                                    </div>
                                    <div className="w-16">
                                        <Input
                                            type="number"
                                            className="h-9 bg-white/50 border-slate-200 focus:ring-blue-500/20 rounded-lg text-center font-mono text-xs"
                                            value={rotateAngle}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                if (!isNaN(val)) setRotateAngle(Math.max(0, Math.min(360, val)));
                                            }}
                                            min={0}
                                            max={360}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setRotateAngle(0)}
                                        className="h-8 text-xs text-zinc-500 hover:text-zinc-700"
                                        disabled={rotateAngle === 0}
                                    >
                                        Reset to 0°
                                    </Button>
                                </div>
                            </div>



                            <div className="pt-2">
                                <Button
                                    className="w-full h-12 font-bold shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/30 transition-all duration-300 rounded-xl"
                                    onClick={processFiles} disabled={isProcessing || files.length === 0}>
                                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Rotate Images
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* FLIP */}
                    <TabsContent value="flip" className="mt-0 focus-visible:outline-none">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700">Direction</Label>
                                <Select value={flipDirection} onValueChange={(v) => setFlipDirection(v as "horizontal" | "vertical")} disabled={isProcessing}>
                                    <SelectTrigger className="h-11 bg-white/50 border-slate-200 focus:ring-blue-500/20 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="horizontal">Horizontal</SelectItem>
                                        <SelectItem value="vertical">Vertical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>



                            <div className="pt-2">
                                <Button
                                    className="w-full h-12 font-bold shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/30 transition-all duration-300 rounded-xl"
                                    onClick={processFiles} disabled={isProcessing || files.length === 0}>
                                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Flip Images
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* CROP */}
                    <TabsContent value="crop" className="mt-0 focus-visible:outline-none">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700">Aspect Ratio</Label>
                                <Select value={cropAspectRatio} onValueChange={setCropAspectRatio} disabled={isProcessing}>
                                    <SelectTrigger className="h-11 bg-white/50 border-slate-200 focus:ring-blue-500/20 rounded-xl">
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
                                <Label className="font-semibold text-zinc-700">Download Mode</Label>
                                <Select value={downloadMode} onValueChange={(v) => setDownloadMode(v as "individual" | "zip")} disabled={isProcessing}>
                                    <SelectTrigger className="h-11 bg-white/50 border-zinc-200 focus:ring-indigo-500/20 rounded-xl hover:bg-white/80 transition-colors">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="individual">Download Individually</SelectItem>
                                        <SelectItem value="zip">Download All (ZIP)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-2">
                                <Button
                                    className="w-full h-12 font-bold shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/30 transition-all duration-300 rounded-xl"
                                    onClick={processFiles} disabled={isProcessing || files.length === 0}>
                                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Apply Crop
                                </Button>
                            </div>
                            <p className="text-[11px] text-muted-foreground text-center bg-slate-50 py-2 rounded-md">
                                Adjust crop on the main canvas.
                            </p>
                        </div>
                    </TabsContent>

                    {/* ADJUST */}
                    <TabsContent value="adjust" className="mt-0 focus-visible:outline-none">
                        <div className="grid grid-cols-1 gap-5">
                            <div className="flex justify-end -mb-4">
                                <Button variant="ghost" size="sm" onClick={resetAdjustments} className="h-6 text-xs text-zinc-500 hover:text-red-500 hover:bg-red-50">
                                    Reset Adjustments
                                </Button>
                            </div>
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
                            <div className="pt-2">
                                <Button
                                    className="w-full h-12 font-bold shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/30 transition-all duration-300 rounded-xl"
                                    onClick={processFiles} disabled={isProcessing || files.length === 0}>
                                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Apply Adjustments
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* FILTER */}
                    <TabsContent value="filter" className="mt-0 focus-visible:outline-none">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700">Preset Filter</Label>
                                <Select value={selectedFilter} onValueChange={setSelectedFilter} disabled={isProcessing}>
                                    <SelectTrigger className="h-11 bg-white/50 border-slate-200 focus:ring-blue-500/20 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None (Original)</SelectItem>
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
                                <Label className="font-semibold text-zinc-700">Download Mode</Label>
                                <Select value={downloadMode} onValueChange={(v) => setDownloadMode(v as "individual" | "zip")} disabled={isProcessing}>
                                    <SelectTrigger className="h-11 bg-white/50 border-zinc-200 focus:ring-indigo-500/20 rounded-xl hover:bg-white/80 transition-colors">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="individual">Download Individually</SelectItem>
                                        <SelectItem value="zip">Download All (ZIP)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-2">
                                <Button
                                    className="w-full h-12 font-bold shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/30 transition-all duration-300 rounded-xl"
                                    onClick={processFiles} disabled={isProcessing || files.length === 0}>
                                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Apply Filter
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* WATERMARK */}
                    <TabsContent value="watermark" className="mt-0 focus-visible:outline-none">
                        <div className="grid grid-cols-1 gap-4">
                            {/* Type Toggle */}
                            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
                                <button onClick={() => setWatermarkType("text")} className={`py-2 text-xs font-bold rounded-md transition-all ${watermarkType === "text" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Text</button>
                                <button onClick={() => setWatermarkType("image")} className={`py-2 text-xs font-bold rounded-md transition-all ${watermarkType === "image" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Image</button>
                            </div>

                            {watermarkType === "text" ? (
                                <div className="space-y-2">
                                    <Label className="font-semibold text-slate-700">Text Content</Label>
                                    <Input className="h-9 bg-white/50 border-slate-200 focus:ring-blue-500/20 rounded-xl" placeholder="Watermark text..." value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label className="font-semibold text-slate-700">Upload Logo</Label>
                                    <Input type="file" accept="image/*" className="h-9 bg-white/50 border-slate-200 focus:ring-blue-500/20 rounded-xl pt-2 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" onChange={handleWatermarkImageUpload} />
                                    {watermarkImage && <p className="text-[10px] text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Loaded</p>}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="font-semibold text-slate-700">Placement</Label>
                                <Select value={watermarkPosition} onValueChange={setWatermarkPosition}>
                                    <SelectTrigger className="h-9 bg-white/50 border-slate-200 focus:ring-blue-500/20 rounded-xl">
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
                                <div className="flex justify-between">
                                    <Label className="font-semibold text-slate-700 text-xs">{watermarkType === "text" ? "Font Size" : "Image Scale"}</Label>
                                    <span className="text-xs font-mono text-slate-500">{watermarkSize}{watermarkType === "text" ? "px" : "%"}</span>
                                </div>
                                <Slider value={[watermarkSize]} min={5} max={100} step={1} onValueChange={([v]) => setWatermarkSize(v)} />
                            </div>

                            <div className="space-y-4 px-2">
                                <div className="flex justify-between">
                                    <Label className="font-semibold text-slate-700 text-xs">Opacity</Label>
                                    <span className="text-xs font-mono text-slate-500">{watermarkOpacity}%</span>
                                </div>
                                <Slider value={[watermarkOpacity]} min={0} max={100} step={1} onValueChange={([v]) => setWatermarkOpacity(v)} />
                            </div>

                            <div className="pt-2">
                                <Button
                                    className="w-full h-12 font-bold shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/30 transition-all duration-300 rounded-xl"
                                    onClick={processFiles} disabled={isProcessing || files.length === 0}>
                                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Apply Watermark
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* SPLIT */}
                    <TabsContent value="split" className="mt-0 focus-visible:outline-none">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <Label className="font-semibold text-slate-700">Rows</Label>
                                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{splitRows}</span>
                                </div>
                                <Slider value={[splitRows]} min={1} max={10} step={1} onValueChange={([v]) => setSplitRows(v)} />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <Label className="font-semibold text-slate-700">Columns</Label>
                                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{splitCols}</span>
                                </div>
                                <Slider value={[splitCols]} min={1} max={10} step={1} onValueChange={([v]) => setSplitCols(v)} />
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <p className="text-xs text-blue-700 font-medium text-center">
                                    Total Images: <span className="font-bold ml-1">{splitRows * splitCols}</span>
                                </p>
                            </div>

                            <div className="pt-2">
                                <Button
                                    className="w-full h-10 font-bold shadow-lg shadow-blue-500/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-500/30 transition-all duration-300 rounded-xl"
                                    onClick={processFiles} disabled={isProcessing || files.length === 0}>
                                    {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Download Split ZIP
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </div>
            </div>

            {/* Queue Panel */}
            <div className="shrink-0 bg-zinc-50/90 backdrop-blur-2xl shadow-2xl overflow-hidden rounded-2xl md:rounded-none md:rounded-l-2xl border border-white/20 ring-1 ring-black/5">
                {/* Sticky Queue Drawer */}
                <div className="bg-white/80 backdrop-blur-xl border-b border-zinc-200 shadow-sm transition-all duration-300">
                    {/* Drawer Handle / Mini Header */}
                    <div
                        className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-zinc-50 transition-colors"
                        onClick={() => setIsQueueOpen(!isQueueOpen)}
                    >
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
                                <ImageIcon className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold text-sm text-zinc-700">Queue ({files.length})</span>
                        </div>
                        {isQueueOpen ? (
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full hover:bg-zinc-200"><X className="w-3 h-3 text-zinc-500" /></Button>
                        ) : (
                            <div className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse" />
                        )}
                    </div>

                    <AnimatePresence>
                        {isQueueOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="px-6 pb-6"
                            >
                                {/* Upload Area */}
                                <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all mb-4 ${isDragActive ? "border-indigo-500 bg-indigo-50/50" : "border-zinc-200 hover:border-indigo-300 hover:bg-zinc-50"}`}>
                                    <input {...getInputProps()} />
                                    <div className="flex items-center justify-center gap-2 text-xs font-medium text-zinc-500">
                                        <Upload className="w-4 h-4" />
                                        <span>Drop files or click to upload</span>
                                    </div>
                                </div>

                                {/* Queue List */}
                                {files.length > 0 && (
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                        {isProcessing && <Progress value={progress} className="h-1 mb-2 bg-zinc-100" />}

                                        <div className="flex justify-end">
                                            <Button variant="ghost" size="sm" className="h-5 text-[10px] text-zinc-400 hover:text-red-500 px-0" onClick={(e) => { e.stopPropagation(); setFiles([]); }}>Clear All</Button>
                                        </div>

                                        {files.map((item, index) => (
                                            <div key={index}
                                                className={`group flex items-center justify-between p-2 rounded-lg border transition-all ${selectedFileIndex === index
                                                    ? 'bg-indigo-50/50 border-indigo-200 shadow-sm'
                                                    : 'bg-white border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 cursor-pointer'
                                                    }`}
                                                onClick={() => setSelectedFileIndex(index)}
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                                                        <img
                                                            src={item.previewFile ? URL.createObjectURL(item.previewFile) : URL.createObjectURL(item.file)}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.parentElement?.classList.add('bg-zinc-100');
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={`text-xs font-semibold truncate ${selectedFileIndex === index ? 'text-indigo-700' : 'text-zinc-700'}`}>
                                                            {item.file.name}
                                                        </p>
                                                        <p className="text-[10px] text-zinc-400">
                                                            {(item.file.size / 1024 / 1024).toFixed(2)} MB
                                                            {item.newSize && <span className="text-emerald-600 ml-1.5">→ {item.newSize}</span>}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    {item.status === 'processing' && <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />}
                                                    {item.status === 'done' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-300 hover:text-red-500 hover:bg-transparent opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); removeFile(index); }}><X className="w-3 h-3" /></Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
