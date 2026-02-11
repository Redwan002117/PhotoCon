import ImageCompressor from "@/components/tools/ImageCompressor";
import { ToolShell } from "@/components/tools/ToolShell";

export const metadata = {
    title: "Advanced Image Compressor | PhotoCon",
    description: "Reduce image file size to a specific target (e.g., 50KB) using advanced compression algorithms. Free and private.",
};

export default function CompressPage() {
    return (
        <ToolShell
            title="Advanced Image Compressor"
            description="Reduce file size without quality loss. Set a target size (e.g., 500KB) and we'll optimize the image to fit."
        >
            <ImageCompressor />
        </ToolShell>
    );
}
