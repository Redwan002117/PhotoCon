'use client';

import React from 'react';
import { useImageStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { FlipHorizontal, FlipVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

export const FlipControls = () => {
    const { flipX, flipY, toggleFlipX, toggleFlipY } = useImageStore();

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Button
                    variant="outline"
                    className={cn("h-24 flex flex-col gap-2", flipX && "border-blue-500 bg-blue-50 text-blue-700")}
                    onClick={toggleFlipX}
                >
                    <FlipHorizontal className="w-8 h-8" />
                    <span>Flip Horizontally</span>
                </Button>

                <Button
                    variant="outline"
                    className={cn("h-24 flex flex-col gap-2", flipY && "border-blue-500 bg-blue-50 text-blue-700")}
                    onClick={toggleFlipY}
                >
                    <FlipVertical className="w-8 h-8" />
                    <span>Flip Vertically</span>
                </Button>
            </div>

            <p className="text-xs text-slate-500 text-center mt-2">
                Click to toggle flip state.
            </p>
        </div>
    );
};
