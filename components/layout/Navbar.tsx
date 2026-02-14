'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Image as ImageIcon,
    Grid3X3
} from 'lucide-react';

export const Navbar = () => {
    return (
        <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
                        <ImageIcon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-zinc-900">PhotoCon</span>
                </Link>

                {/* Nav Actions */}
                <div className="flex items-center gap-2">
                    {/* Placeholder for future nav items or user profile */}
                </div>
            </div>
        </nav>
    );
};
