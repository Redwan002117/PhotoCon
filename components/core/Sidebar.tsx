import { motion } from "framer-motion";
import {
    FileType,
    RefreshCw,
    Maximize2,
    RotateCw,
    FlipHorizontal,
    Scissors,
    Sliders,
    Palette,
    Type,
    FileText,
    Grid3X3
} from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SidebarProps {
    className?: string;
    currentMode: string;
}

export const Sidebar = ({ className, currentMode }: SidebarProps) => {
    const items = [
        { value: "convert", icon: FileType, label: "Convert" },
        { value: "compress", icon: RefreshCw, label: "Compress" },
        { value: "resize", icon: Maximize2, label: "Resize" },
        { value: "crop", icon: Scissors, label: "Crop" },
        { value: "rotate", icon: RotateCw, label: "Rotate" },
        { value: "flip", icon: FlipHorizontal, label: "Flip" },
        { value: "adjust", icon: Sliders, label: "Adjust" },
        { value: "filter", icon: Palette, label: "Filter" },
        { value: "watermark", icon: Type, label: "Watermark" },
        { value: "split", icon: Grid3X3, label: "Split" },
    ];

    return (
        <TabsList className="flex flex-row md:flex-col h-[72px] md:h-auto w-full md:w-[150px] bg-white/80 border-b md:border-b-0 md:border-r border-zinc-200/50 p-1 gap-1 shrink-0 overflow-x-auto md:overflow-x-visible items-center justify-center shadow-sm z-10 backdrop-blur-sm md:pt-4 md:pb-4">
            <div className="flex flex-row md:grid md:grid-cols-2 items-center justify-start md:justify-center md:content-center min-h-full w-full gap-1 md:gap-1 p-1 md:py-2">
                {items.map((t) => {
                    const isActive = currentMode === t.value;
                    return (
                        <TabsTrigger
                            key={t.value}
                            value={t.value}
                            className="relative group flex flex-col items-center justify-center group-data-[orientation=vertical]/tabs:justify-center gap-1 w-14 md:w-12 xl:w-14 aspect-square p-0 
                            text-zinc-500 hover:text-indigo-600 
                            data-[state=active]:text-indigo-600 
                            transition-colors duration-200 rounded-xl shrink-0 border border-transparent"
                            title={t.label}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-sidebar-item"
                                    className="absolute inset-0 bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm shadow-indigo-100/50"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            <div className="relative z-10 flex flex-col items-center gap-1">
                                <t.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="text-[9px] font-semibold opacity-70 group-hover:opacity-100">{t.label}</span>
                            </div>
                        </TabsTrigger>
                    );
                })}
            </div>
        </TabsList>
    );
};
