"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, FileType, RefreshCw, Maximize2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/tools", icon: Layers, label: "All Tools" },
    { href: "/converter", icon: FileType, label: "Convert" },
    { href: "/compress-image", icon: RefreshCw, label: "Compress" },
    { href: "/resize-image", icon: Maximize2, label: "Resize" },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-gray-600 hover:text-gray-900"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
