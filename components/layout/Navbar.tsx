'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Menu,
    FlipHorizontal,
    RotateCw,
    Crop,
    FileType,
    Image as ImageIcon
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
    return (
        <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-slate-900 text-white p-1.5 rounded-lg">
                        <ImageIcon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-900">PhotoCon</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    <Link href="/flip-image">
                        <Button variant="ghost" className="text-slate-600">
                            <FlipHorizontal className="w-4 h-4 mr-2" />
                            Flip
                        </Button>
                    </Link>
                    <Link href="/rotate-image">
                        <Button variant="ghost" className="text-slate-600">
                            <RotateCw className="w-4 h-4 mr-2" />
                            Rotate
                        </Button>
                    </Link>
                    <Link href="/crop-image">
                        <Button variant="ghost" className="text-slate-600">
                            <Crop className="w-4 h-4 mr-2" />
                            Crop
                        </Button>
                    </Link>
                    <Link href="/pdf-to-image">
                        <Button variant="ghost" className="text-slate-600">
                            <FileType className="w-4 h-4 mr-2" />
                            PDF to Image
                        </Button>
                    </Link>
                    <Link href="/resize-image">
                        <Button variant="ghost" className="text-slate-600">
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Bulk Resize
                        </Button>
                    </Link>
                </div>

                {/* Mobile Nav */}
                <div className="md:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-slate-300 shadow-2xl min-w-[200px]">
                            <DropdownMenuItem asChild>
                                <Link href="/flip-image" className="cursor-pointer">
                                    <FlipHorizontal className="w-4 h-4 mr-2" /> Flip Image
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/rotate-image" className="cursor-pointer">
                                    <RotateCw className="w-4 h-4 mr-2" /> Rotate Image
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/crop-image" className="cursor-pointer">
                                    <Crop className="w-4 h-4 mr-2" /> Crop Image
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/resize-image" className="cursor-pointer">
                                    <ImageIcon className="w-4 h-4 mr-2" /> Bulk Resize
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/pdf-to-image" className="cursor-pointer">
                                    <FileType className="w-4 h-4 mr-2" /> PDF to Image
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    );
};
