import React from 'react';
import { ToolShell } from '@/components/tools/ToolShell';
import { FlipControls } from '@/components/tools/actions/FlipControls';

export const metadata = {
    title: 'Flip Image Online - PhotoCon',
    description: 'Mirror images horizontally or vertically instantly. Free online tool.'
};

export default function FlipImagePage() {
    return (
        <ToolShell
            title="Flip Image"
            description="Mirror your images horizontally or vertically in seconds. No upload to server required."
        >
            <FlipControls />
        </ToolShell>
    );
}
