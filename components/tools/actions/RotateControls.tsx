'use client';

import React from 'react';
import { useImageStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { RotateCw, RotateCcw } from 'lucide-react';
// import { Slider } from '@/components/ui/slider'; 
import { cn } from '@/lib/utils';

export const RotateControls = () => {
    const { rotation, setRotation } = useImageStore();

    const rotateLeft = () => setRotation((rotation - 90) % 360);
    const rotateRight = () => setRotation((rotation + 90) % 360);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2"
                    onClick={rotateLeft}
                >
                    <RotateCcw className="w-8 h-8" />
                    <span>Rotate Left</span>
                </Button>

                <Button
                    variant="outline"
                    className="h-24 flex flex-col gap-2"
                    onClick={rotateRight}
                >
                    <RotateCw className="w-8 h-8" />
                    <span>Rotate Right</span>
                </Button>
            </div>

            <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-3">Preset Angles</p>
                <div className="flex gap-2 flex-wrap mb-4">
                    {[0, 90, 180, 270].map((angle) => (
                        <Button
                            key={angle}
                            variant={Math.abs(rotation % 360) === angle ? "default" : "secondary"}
                            size="sm"
                            onClick={() => setRotation(angle)}
                        >
                            {angle}°
                        </Button>
                    ))}
                </div>

                <p className="text-sm font-medium mb-2">Free Rotation</p>
                <input
                    type="range"
                    min="0"
                    max="360"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                />
            </div>

            <p className="text-xs text-slate-500 text-center mt-2">
                Current Rotation: {rotation}°
            </p>
        </div>
    );
};
