'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    FlipHorizontal,
    RotateCw,
    Crop,
    FileType,
    Image as ImageIcon,
    ArrowUpRight,
    RefreshCw,
    Layers,
    Maximize2,
    Grid3X3
} from 'lucide-react';
import { containerVariants, cardVariants } from '@/lib/animations';

const tools = [
    {
        title: "All-in-One Tool",
        desc: "Convert, compress, resize, rotate, flip, and crop - all in one unified interface. Switch modes instantly.",
        icon: Layers,
        href: "/tools",
        color: "bg-gradient-to-br from-purple-500 to-pink-500"
    },
    {
        title: "Universal Converter",
        desc: "Convert any image format (RAW, HEIC, TIFF) to JPG, PNG, WebP, AVIF, and more. Batch processing supported.",
        icon: FileType,
        href: "/converter",
        color: "bg-gradient-to-br from-blue-500 to-cyan-500"
    },
    {
        title: "Smart Compressor",
        desc: "Compress images to exact file sizes while maintaining quality. Perfect for web optimization.",
        icon: RefreshCw,
        href: "/compress-image",
        color: "bg-gradient-to-br from-green-500 to-emerald-500"
    },
    {
        title: "Bulk Resizer",
        desc: "Resize multiple images at once by percentage or exact dimensions. Fast and efficient.",
        icon: Maximize2,
        href: "/resize-image",
        color: "bg-gradient-to-br from-orange-500 to-amber-500"
    },
    {
        title: "Rotate Image",
        desc: "Rotate images by 90°, 180°, or 270° with a single click. No quality loss.",
        icon: RotateCw,
        href: "/rotate-image",
        color: "bg-gradient-to-br from-red-500 to-rose-500"
    },
    {
        title: "Flip Image",
        desc: "Flip images horizontally or vertically. Instant preview and download.",
        icon: FlipHorizontal,
        href: "/flip-image",
        color: "bg-gradient-to-br from-indigo-500 to-purple-500"
    },
    {
        title: "Crop Image",
        desc: "Crop images with custom aspect ratios. Precise control over your images.",
        icon: Crop,
        href: "/crop-image",
        color: "bg-gradient-to-br from-teal-500 to-cyan-500"
    },
    {
        title: "Split Image",
        desc: "Split your photos into a grid (e.g., 3x3, 2x2). Great for Instagram grids and puzzles.",
        icon: Grid3X3,
        href: "/split-image",
        color: "bg-gradient-to-br from-pink-500 to-rose-500"
    }
];

export const Features = () => {
    return (
        <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white">
            <div className="container mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">Powerful Tools</h2>
                    <p className="text-slate-600 text-lg">Everything you need to work with images, right in your browser</p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                            <motion.div key={tool.href} variants={cardVariants}>
                                <Link href={tool.href}>
                                    <div className="group relative overflow-hidden bg-white rounded-xl border border-slate-200 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 h-full">
                                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity ${tool.color}`} />
                                        <div className="relative">
                                            <div className={`w-12 h-12 rounded-lg ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-slate-900 mb-2">{tool.title}</h3>
                                            <p className="text-slate-600 text-sm leading-relaxed">{tool.desc}</p>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>
        </section>
    );
};
