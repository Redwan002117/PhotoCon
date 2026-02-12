'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    UploadCloud, 
    Image as ImageIcon, 
    Download, 
    Grid3X3, 
    X, 
    RefreshCw 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SplitImageClient() {
    const [file, setFile] = useState<File | null>(null);
    const [imageBitmap, setImageBitmap] = useState<ImageBitmap | null>(null);
    const [rows, setRows] = useState<number>(3);
    const [cols, setCols] = useState<number>(3);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Cleanup preview URLs on unmount or change
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const f = acceptedFiles[0];
            setFile(f);
            
            // Create ImageBitmap for efficient processing
            createImageBitmap(f).then(bitmap => {
                setImageBitmap(bitmap);
            }).catch(err => {
                console.error("Error loading image:", err);
                // Fallback or error handling could go here
            });
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif']
        },
        maxFiles: 1,
        multiple: false
    });

    // Generate Previews
    useEffect(() => {
        if (!imageBitmap) return;

        const generatePreviews = async () => {
            // Revoke old URLs
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            
            const chunkWidth = imageBitmap.width / cols;
            const chunkHeight = imageBitmap.height / rows;
            const newUrls: string[] = [];

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const canvas = document.createElement('canvas');
                    canvas.width = chunkWidth;
                    canvas.height = chunkHeight;
                    const ctx = canvas.getContext('2d');
                    
                    if (ctx) {
                        ctx.drawImage(
                            imageBitmap,
                            c * chunkWidth, r * chunkHeight, chunkWidth, chunkHeight, // Source
                            0, 0, chunkWidth, chunkHeight // Destination
                        );
                        
                        // For preview, we can use low quality or small size if needed, 
                        // but blob urls are generally fast enough for moderate counts.
                        // Using toDataURL since it's synchronous for previews usually, 
                        // but toBlob is better for memory. Let's use toBlob.
                        await new Promise<void>((resolve) => {
                            canvas.toBlob((blob) => {
                                if (blob) {
                                    newUrls.push(URL.createObjectURL(blob));
                                }
                                resolve();
                            }, 'image/jpeg', 0.7);
                        });
                    }
                }
            }
            setPreviewUrls(newUrls);
        };

        const timeoutId = setTimeout(generatePreviews, 50); // Debounce slightly
        return () => clearTimeout(timeoutId);
    }, [imageBitmap, rows, cols]);


    const handleDownload = async () => {
        if (!imageBitmap || !file) return;
        setIsProcessing(true);

        try {
            const zip = new JSZip();
            const chunkWidth = imageBitmap.width / cols;
            const chunkHeight = imageBitmap.height / rows;
            
            // Get original extension
            const originalExt = file.name.split('.').pop() || 'jpg';
            const originalName = file.name.split('.')[0];

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                     const canvas = document.createElement('canvas');
                    canvas.width = chunkWidth;
                    canvas.height = chunkHeight;
                    const ctx = canvas.getContext('2d');
                    
                    if (ctx) {
                        ctx.drawImage(
                            imageBitmap,
                            c * chunkWidth, r * chunkHeight, chunkWidth, chunkHeight,
                            0, 0, chunkWidth, chunkHeight
                        );
                        
                        // Convert to blob
                        const blob = await new Promise<Blob | null>(resolve => 
                            canvas.toBlob(resolve, file.type || 'image/png')
                        );

                        if (blob) {
                            // Filename: name_row_col.ext
                            const filename = `${originalName}_${r+1}_${c+1}.${originalExt}`;
                            zip.file(filename, blob);
                        }
                    }
                }
            }

            // Generate and download zip
            const content = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${originalName}_grid_${rows}x${cols}.zip`;
            link.click();
            URL.revokeObjectURL(link.href);

        } catch (error) {
            console.error("Failed to generate zip", error);
            // Could add toast error here
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setFile(null);
        setImageBitmap(null);
        setPreviewUrls([]);
    };

    return (
        <div className="container mx-auto py-12 px-4 max-w-6xl">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Split Image (Grid Maker)</h1>
                <p className="text-lg text-slate-600">Split your photos into a grid for Instagram or puzzles. Download as a ZIP.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
                {!file ? (
                    <div className="p-12 flex items-center justify-center h-full min-h-[400px]">
                         <div
                            {...getRootProps()}
                            className={cn(
                                "flex flex-col items-center justify-center w-full max-w-2xl h-80 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 bg-slate-50",
                                isDragActive ? "border-blue-500 bg-blue-50 scale-[1.01]" : "border-slate-300 hover:border-slate-400 hover:bg-slate-100"
                            )}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center justify-center p-6 text-center">
                                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                    <UploadCloud className={cn("w-8 h-8", isDragActive ? "text-blue-500" : "text-slate-400")} />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-700 mb-1">Click to upload or drag & drop</h3>
                                <p className="text-sm text-slate-500">Supports JPG, PNG, WebP (Max 20MB)</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row h-full">
                        {/* Settings Panel */}
                        <div className="w-full lg:w-80 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 p-6 flex-shrink-0">
                            <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                                <Grid3X3 className="w-5 h-5 text-blue-600" />
                                Grid Settings
                            </h3>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label>Rows</Label>
                                        <span className="text-sm font-mono bg-white px-2 py-1 rounded border">{rows}</span>
                                    </div>
                                    <Slider 
                                        value={[rows]} 
                                        onValueChange={(v) => setRows(v[0])} 
                                        min={1} max={10} step={1} 
                                        className="py-2"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label>Columns</Label>
                                        <span className="text-sm font-mono bg-white px-2 py-1 rounded border">{cols}</span>
                                    </div>
                                    <Slider 
                                        value={[cols]} 
                                        onValueChange={(v) => setCols(v[0])} 
                                        min={1} max={10} step={1} 
                                        className="py-2"
                                    />
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                    <p className="text-sm text-blue-700 font-medium text-center">
                                        Total Images: <span className="font-bold text-lg ml-1">{rows * cols}</span>
                                    </p>
                                </div>

                                <Button 
                                    size="lg" 
                                    className="w-full" 
                                    onClick={handleDownload}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4 mr-2" />
                                            Download ZIP
                                        </>
                                    )}
                                </Button>
                                
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full text-slate-500 hover:text-red-500 hover:bg-red-50 border-slate-200"
                                    onClick={reset}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Choose Different Image
                                </Button>
                            </div>
                        </div>

                        {/* Preview Area */}
                        <div className="flex-1 bg-slate-100/50 p-8 overflow-y-auto">
                           <div className="flex flex-col items-center min-h-full justify-center">
                                <div className="relative shadow-xl rounded-lg overflow-hidden border border-slate-200 bg-white" 
                                     style={{ 
                                         // Max width constraint for preview
                                         maxWidth: '100%', 
                                         maxHeight: '80vh',
                                         display: 'grid',
                                         gridTemplateColumns: `repeat(${cols}, 1fr)`,
                                         gap: '2px', // Visible grid lines
                                         backgroundColor: '#e2e8f0', // Color of the gap (grid lines)
                                         padding: '2px' // Outer border
                                     }}
                                >
                                    {previewUrls.map((url, i) => (
                                        <img 
                                            key={i} 
                                            src={url} 
                                            alt={`Slice ${i}`} 
                                            className="w-full h-full object-cover block bg-white"
                                        />
                                    ))}
                                    {previewUrls.length === 0 && (
                                        <div className="p-12 text-slate-400">Loading Preview...</div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-4">Preview shows grid lines for visualization. Downloaded files are seamless.</p>
                           </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
