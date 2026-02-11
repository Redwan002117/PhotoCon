import { NextRequest, NextResponse } from 'next/server';
import { createCanvas } from 'canvas';
// Use ESM import for pdfjs-dist v4+
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        if (file.type !== 'application/pdf') {
            return NextResponse.json({ error: "Invalid file type. Please upload a PDF." }, { status: 400 });
        }

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Load PDF
        const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(buffer),
            disableFontFace: true,
            verbosity: 0,
            // standardFontDataUrl: ...
        });

        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1); // Convert 1st page for MVP

        const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for quality

        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');

        // Fill background with white (PDFs can be transparent)
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, viewport.width, viewport.height);

        const renderContext = {
            canvasContext: context as any,
            viewport: viewport,
        };

        await page.render(renderContext as any).promise;

        // Export to Buffer
        const imageBuffer = canvas.toBuffer('image/png');

        // Return as response
        // @ts-ignore
        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
                'Content-Disposition': `attachment; filename="converted-page-1.png"`,
            },
        });

    } catch (error: any) {
        console.error("PDF Conversion Error:", error);
        return NextResponse.json({ error: "Conversion failed", details: error.message }, { status: 500 });
    }
}
