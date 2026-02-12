import UnifiedImageTool from "@/components/tools/UnifiedImageTool";
import { ToolShell } from "@/components/tools/ToolShell";

export const metadata = {
    title: "All-in-One Image Tool | PhotoCon",
    description: "Convert, compress, resize, crop, rotate, and flip images in one unified tool. Process files locally for maximum privacy.",
};

export default function AllToolsPage() {
    return (
        <main className="h-[calc(100vh-65px)] overflow-hidden bg-slate-50 relative">
            <UnifiedImageTool />
        </main>
    );
}
