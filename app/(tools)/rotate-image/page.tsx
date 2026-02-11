import React from 'react';
import { ToolShell } from '@/components/tools/ToolShell';
import { RotateControls } from '@/components/tools/actions/RotateControls';

export const metadata = {
    title: 'Rotate Image Online - PhotoCon',
    description: 'Rotate images 90, 180, or 270 degrees online for free.'
};

export default function RotateImagePage() {
    return (
        <ToolShell
            title="Rotate Image"
            description="Rotate your photos to the perfect angle. Correct orientation problems instantly."
        >
            <RotateControls />
        </ToolShell>
    );
}
