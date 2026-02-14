/**
 * Reads the EXIF orientation from an image file.
 * Returns a number 1-8 representing the orientation, or 1 if not found.
 */
export async function getOrientation(file: File): Promise<number> {
    return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (event: ProgressEvent<FileReader>) => {
            if (!event.target?.result) {
                return resolve(1);
            }

            const view = new DataView(event.target.result as ArrayBuffer);

            if (view.getUint16(0, false) !== 0xFFD8) {
                return resolve(1); // Not a JPEG
            }

            const length = view.byteLength;
            let offset = 2;

            while (offset < length) {
                const marker = view.getUint16(offset, false);
                offset += 2;

                if (marker === 0xFFE1) {
                    if (view.getUint32(offset + 2, false) !== 0x45786966) { // "Exif"
                        return resolve(1);
                    }
                    const little = view.getUint16(offset + 8, false) === 0x4949;
                    offset += 8;
                    const tags = view.getUint16(offset, little);
                    offset += 2;

                    for (let i = 0; i < tags; i++) {
                        if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                            return resolve(view.getUint16(offset + (i * 12) + 8, little));
                        }
                    }
                } else if ((marker & 0xFF00) !== 0xFF00) {
                    break;
                } else {
                    offset += view.getUint16(offset, false);
                }
            }
            return resolve(1);
        };

        reader.readAsArrayBuffer(file.slice(0, 64 * 1024)); // Read first 64KB
    });
}
