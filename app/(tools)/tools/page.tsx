import UnifiedImageTool from "@/components/tools/UnifiedImageTool";
import { ToolShell } from "@/components/tools/ToolShell";

export const metadata = {
    title: "All-in-One Image Tool | PhotoCon",
    description: "Convert, compress, resize, crop, rotate, and flip images in one unified tool. Process files locally for maximum privacy.",
};

export default function AllToolsPage() {
    return (
        <ToolShell
            title="All-in-One Image Tool"
            description="Convert formats, compress to target size, resize dimensions, rotate angles, flip directions - all in one place. 100% private, client-side processing."
        >
            <UnifiedImageTool />
        </ToolShell>
    );
}
