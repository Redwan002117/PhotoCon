'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, UploadCloud, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
// import { useToast } from '@/hooks/use-toast'; 

export const PDFUploader = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.length > 0) {
            setFile(acceptedFiles[0]);
            setDownloadUrl(null); // Reset prev conversion
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        multiple: false
    });

    const handleConvert = async () => {
        if (!file) return;

        setIsConverting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/convert/pdf-to-image', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Conversion failed');

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
        } catch (error) {
            console.error(error);
            alert("Failed to convert PDF. Please try again.");
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            {!file && (
                <div
                    {...getRootProps()}
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ease-in-out",
                        isDragActive ? "border-red-500 bg-red-50" : "border-slate-300 hover:border-slate-400 bg-slate-50"
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                        <FileText className={cn("w-12 h-12 mb-4", isDragActive && "text-red-500")} />
                        <p className="mb-2 text-sm"><span className="font-semibold">Click to upload PDF</span> or drag and drop</p>
                        <p className="text-xs">PDF Documents only (MAX. 10MB)</p>
                    </div>
                </div>
            )}

            {file && !downloadUrl && (
                <div className="bg-white p-6 rounded-xl border shadow-sm text-center">
                    <FileText className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="font-medium text-slate-900 mb-1">{file.name}</p>
                    <p className="text-sm text-slate-500 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => setFile(null)} disabled={isConverting}>
                            Cancel
                        </Button>
                        <Button onClick={handleConvert} disabled={isConverting}>
                            {isConverting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isConverting ? "Converting..." : "Convert to Image"}
                        </Button>
                    </div>
                </div>
            )}

            {downloadUrl && (
                <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-center">
                    <p className="text-green-700 font-medium mb-4">Conversion Successful!</p>
                    <img src={downloadUrl} alt="Preview" className="h-48 mx-auto shadow-md mb-6 border rounded" />

                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => { setFile(null); setDownloadUrl(null); }}>
                            Convert Another
                        </Button>
                        <a href={downloadUrl} download={`converted-${file?.name.replace('.pdf', '')}.png`}>
                            <Button className="bg-green-600 hover:bg-green-700">
                                <Download className="w-4 h-4 mr-2" />
                                Download PNG
                            </Button>
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};
