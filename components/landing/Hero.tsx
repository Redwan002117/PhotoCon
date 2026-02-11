'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export const Hero = () => {
    return (
        <section className="relative overflow-hidden bg-white/50 pt-20 pb-32">
            <div className="container mx-auto px-4 max-w-6xl relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 mb-6 border border-slate-200">
                        <Sparkles className="mr-1.5 h-4 w-4 text-amber-500" />
                        v1.0 is Live: Privacy-First Tools
                    </span>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6">
                        Master Your Images.<br />
                        <span className="text-slate-400">Instantly.</span>
                    </h1>

                    <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Resize, crop, and convert images directly in your browser.
                        No uploads, no waiting, no quality loss.
                        <span className="font-semibold text-slate-800"> 100% Free & Private.</span>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="#tools">
                            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all hover:scale-105 hover:shadow-xl">
                                Explore Tools <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/manuals">
                            <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-2 border-blue-600 hover:bg-blue-50 text-blue-700 font-semibold hover:border-blue-700 transition-all">
                                View Documentation
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob" />
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
                <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-pink-200/30 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-4000" />
            </div>
        </section>
    );
};
