import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Upload, ImageIcon } from "lucide-react";
import { DropzoneRootProps, DropzoneInputProps } from "react-dropzone";
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface CanvasAreaProps {
    previewUrl: string | null;
    mode: string;
    isPreviewProcessing: boolean;
    // Crop Props
    crop?: Crop;
    setCrop?: (c: Crop) => void;
    setCompletedCrop?: (c: PixelCrop) => void;
    aspect?: number;
    onImageLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
    // Split Props
    splitRows?: number;
    splitCols?: number;
    // Dropzone Props
    getRootProps?: <T extends DropzoneRootProps>(props?: T) => T;
    getInputProps?: <T extends DropzoneInputProps>(props?: T) => T;
    isDragActive?: boolean;
}

export const CanvasArea = ({
    previewUrl, mode, isPreviewProcessing,
    crop, setCrop, setCompletedCrop, aspect, onImageLoad,
    splitRows = 3, splitCols = 3,
    getRootProps, getInputProps, isDragActive
}: CanvasAreaProps) => {
    return (
        <div className="flex-1 bg-zinc-50/50 flex flex-col min-w-0 relative overflow-hidden">
            {/* Toolbar / Header */}
            <div className="h-16 px-6 border-b border-zinc-200/50 bg-white/80 backdrop-blur-md flex items-center justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg text-white shadow-lg shadow-indigo-500/20">
                        <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-zinc-800 uppercase tracking-wide">
                            {mode} Image
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isPreviewProcessing && (
                        <div className="flex items-center gap-2 text-[10px] text-indigo-600 font-bold animate-pulse px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            PROCESSING...
                        </div>
                    )}
                </div>
            </div>

            {/* Canvas Scroll Area */}
            <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center relative bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:20px_20px]">
                <AnimatePresence mode="wait">
                    {previewUrl ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                            className="relative max-w-full max-h-full flex items-center justify-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden ring-1 ring-black/5 bg-white p-2"
                        >
                            {mode === 'crop' && crop && setCrop && setCompletedCrop ? (
                                <ReactCrop
                                    crop={crop}
                                    onChange={c => setCrop(c)}
                                    onComplete={c => setCompletedCrop(c)}
                                    aspect={aspect}
                                    className="max-w-full max-h-[calc(100vh-200px)] rounded-lg overflow-hidden"
                                >
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="max-w-full max-h-[calc(100vh-200px)] object-contain"
                                        onLoad={onImageLoad}
                                    />
                                </ReactCrop>
                            ) : (
                                <div className="relative rounded-lg overflow-hidden">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="max-w-full max-h-[calc(100vh-200px)] object-contain"
                                    />
                                    {mode === 'split' && (
                                        <div
                                            className="absolute inset-0 pointer-events-none z-10"
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: `repeat(${splitCols}, 1fr)`,
                                                gridTemplateRows: `repeat(${splitRows}, 1fr)`
                                            }}
                                        >
                                            {Array.from({ length: splitRows * splitCols }).map((_, i) => (
                                                <div key={i} className="border border-white/50 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.5)]" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <div
                            {...(getRootProps ? getRootProps() : {})}
                            className={`cursor-pointer transition-all duration-300 w-full max-w-md mx-auto
                                ${isDragActive ? "scale-105 ring-4 ring-indigo-500/20" : "hover:scale-105"}
                           `}
                        >
                            <input {...(getInputProps ? getInputProps() : {})} />
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center space-y-6"
                            >
                                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl border transition-colors duration-300
                                    ${isDragActive ? "bg-indigo-50 border-indigo-200 shadow-indigo-500/20" : "bg-white shadow-slate-200/50 border-white"}
                                `}>
                                    <Upload className={`w-10 h-10 transition-colors duration-300 ${isDragActive ? "text-indigo-500" : "text-slate-300"}`} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className={`text-xl font-bold transition-colors duration-300 ${isDragActive ? "text-indigo-700" : "text-slate-800"}`}>
                                        {isDragActive ? "Drop Images Here" : "No Image Selected"}
                                    </h3>
                                    <p className="text-slate-500 text-sm max-w-[280px] mx-auto leading-relaxed">
                                        Drag & drop files here, or click to browse from your device.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div >
        </div >
    );
};
