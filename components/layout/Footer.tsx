import React from 'react';
import Link from 'next/link';

export const Footer = () => {
    return (
        <footer className="border-t border-slate-100 bg-white pt-16 pb-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="font-bold text-xl mb-4">PhotoCon</h3>
                        <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                            Open-source, privacy-first image tools built for the modern web.
                            No servers, no tracking, just utility.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-slate-900">Tools</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><Link href="/pdf-to-image" className="hover:text-blue-600">PDF to Image</Link></li>
                            <li><Link href="/resize-image" className="hover:text-blue-600">Bulk Resize</Link></li>
                            <li><Link href="/crop-image" className="hover:text-blue-600">Crop Image</Link></li>
                            <li><Link href="/rotate-image" className="hover:text-blue-600">Rotate Image</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-slate-900">Legal</h4>
                        <ul className="space-y-2 text-sm text-slate-500">
                            <li><Link href="#" className="hover:text-blue-600">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-blue-600">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-blue-600">GitHub</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-50 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
                    <p>© {new Date().getFullYear()} PhotoCon. All rights reserved.</p>
                    <p>Built with Next.js & Tailwind</p>
                </div>
            </div>
        </footer>
    );
};
