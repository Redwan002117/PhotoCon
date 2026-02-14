"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    ImageIcon,
    Zap,
    Maximize2,
    Scissors,
    Layers,
    Download,
    ShieldCheck,
    Sparkles,
    ArrowRight
} from "lucide-react";

interface LandingPageProps {
    onLaunch: () => void;
}

export const LandingPage = ({ onLaunch }: LandingPageProps) => {
    return (
        <div className="min-h-[100dvh] bg-white text-zinc-900 scroll-smooth overflow-x-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[100px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 container mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-2xl tracking-tight text-zinc-900">PhotoCon</span>
                </div>
                <div>
                    <Button
                        onClick={onLaunch}
                        className="rounded-full px-6 bg-zinc-900 hover:bg-zinc-800 text-white font-medium shadow-xl shadow-zinc-900/10 transition-all hover:scale-105"
                    >
                        Launch App
                    </Button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 container mx-auto px-6 pt-20 pb-32 text-center md:text-left md:flex items-center gap-12">
                <div className="md:w-1/2 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
                            <Sparkles className="w-3 h-3" />
                            <span>Professional Image Tools</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-zinc-900">
                            Master your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Digital Assets.</span>
                        </h1>
                        <p className="text-xl text-zinc-500 mt-6 max-w-lg leading-relaxed">
                            Convert, compress, and edit images securely in your browser. No uploads, no quality loss, just pure performance.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex flex-wrap items-center gap-4"
                    >
                        <Button
                            onClick={onLaunch}
                            size="lg"
                            className="h-14 px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-500/30 transition-all hover:scale-105 hover:-translate-y-1"
                        >
                            Get Started <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-4 px-6 text-sm font-medium text-zinc-500">
                            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure</span>
                            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> Fast</span>
                        </div>
                    </motion.div>
                </div>

                {/* Hero Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="hidden md:block md:w-1/2 relative"
                >
                    <div className="relative z-10 bg-white/40 backdrop-blur-xl p-4 rounded-3xl border border-white/50 shadow-2xl shadow-indigo-900/10 rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
                        <div className="aspect-[4/3] bg-gradient-to-br from-zinc-100 to-white rounded-2xl overflow-hidden relative group">
                            <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:16px_16px]" />

                            {/* App Interface Mockup Elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500 rounded-2xl shadow-2xl shadow-indigo-500/40 flex items-center justify-center">
                                <ImageIcon className="w-12 h-12 text-white/90" />
                            </div>

                            {/* Floating Badges */}
                            <div className="absolute top-12 right-12 bg-white/90 backdrop-blur shadow-lg p-3 rounded-xl flex items-center gap-3 animate-bounce [animation-duration:3s]">
                                <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600"><Download className="w-4 h-4" /></div>
                                <div className="text-xs font-bold text-zinc-700">Compressed 80%</div>
                            </div>

                            <div className="absolute bottom-12 left-12 bg-white/90 backdrop-blur shadow-lg p-3 rounded-xl flex items-center gap-3 animate-bounce [animation-duration:4s]">
                                <div className="bg-violet-100 p-1.5 rounded-lg text-violet-600"><Layers className="w-4 h-4" /></div>
                                <div className="text-xs font-bold text-zinc-700">Converted to PNG</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="relative z-10 container mx-auto px-6 py-24 border-t border-zinc-100">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-zinc-900 tracking-tight mb-4">Powerful Tools for Creators</h2>
                    <p className="text-lg text-zinc-500">Everything you need to manage your images in one place.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: Zap, title: "Smart Compression", desc: "Reduce file size up to 90% without losing visual quality." },
                        { icon: Layers, title: "Format Conversion", desc: "Convert between JPG, PNG, WEBP, HEIC, and more instantly." },
                        { icon: Maximize2, title: "Precise Resize", desc: "Resize images by percentage or exact pixel dimensions." },
                        { icon: Scissors, title: "Advanced Crop", desc: "Crop to specific aspect ratios or freeform dimensions." },
                        { icon: Sparkles, title: "Filters & Adjustments", desc: "Enhance images with brightness, contrast, and preset filters." },
                        { icon: ShieldCheck, title: "100% Client-Side", desc: "Your files never leave your device. Privacy guaranteed." },
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-zinc-50/50 hover:bg-white p-8 rounded-3xl transition-all hover:shadow-xl hover:shadow-zinc-200/50 border border-zinc-100 hover:border-zinc-200/50 group">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-zinc-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-gradient-to-br from-white to-zinc-50">
                                <feature.icon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-3">{feature.title}</h3>
                            <p className="text-zinc-500 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-zinc-50 border-t border-zinc-200 py-12">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2.5 opacity-80 grayscale">
                        <div className="bg-zinc-200 p-1.5 rounded-lg">
                            <ImageIcon className="w-4 h-4 text-zinc-500" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-zinc-700">PhotoCon</span>
                    </div>
                    <p className="text-sm text-zinc-400">© 2026 PhotoCon. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
