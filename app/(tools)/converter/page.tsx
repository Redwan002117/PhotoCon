import UniversalConverter from "@/components/tools/UniversalConverter";
import { ToolShell } from "@/components/tools/ToolShell";

export const metadata = {
    title: "Universal Image Converter | PhotoCon",
    description: "Convert RAW, HEIC, TIFF, PDF and more directly in your browser. Private, fast, and free.",
};

export default function ConverterPage() {
    return (
        <ToolShell
            title="Universal Image Converter"
            description="Convert any image format (RAW, HEIC, TIFF) to JPG, PNG, WEBP, or PDF. Process files locally for maximum privacy."
        >
            <UniversalConverter />
        </ToolShell>
    );
}
