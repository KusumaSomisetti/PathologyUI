'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Button } from '@heroui/button';

type Props = { open: boolean; onClose: () => void; };
type CurrentUser = { signature_url?: string; signature?: string;[k: string]: any };

export default function SignatureDialog({ open, onClose }: Props) {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [src, setSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState<Crop | undefined>(undefined);
    const [done, setDone] = useState<PixelCrop | null>(null);
    const [aspect] = useState<number | undefined>(4 / 3);

    const imgRef = useRef<HTMLImageElement | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        const raw = localStorage.getItem('currentUser');
        setUser(raw ? JSON.parse(raw) : null);
        setSrc(null);
        setCrop(undefined);
        setDone(null);
        setErr(null);
    }, [open]);

    const present = useMemo(
        () => user?.signature_url || user?.signature || '',
        [user]
    );

    const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => setSrc(reader.result as string);
        reader.readAsDataURL(f);
    };


    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        const widthPct = 80;
        const heightPct = (widthPct * 3) / 4; // 60
        setCrop({
            unit: '%',
            width: widthPct,
            height: heightPct,
            x: (100 - widthPct) / 2,
            y: (100 - heightPct) / 2,
        });
    };

    const cropToDataURL = (image: HTMLImageElement, c: PixelCrop) => {
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        const canvas = document.createElement('canvas');
        const w = Math.max(1, Math.floor(c.width * scaleX));
        const h = Math.max(1, Math.floor(c.height * scaleY));
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            image,
            Math.floor(c.x * scaleX),
            Math.floor(c.y * scaleY),
            Math.floor(c.width * scaleX),
            Math.floor(c.height * scaleY),
            0, 0, w, h
        );

        return canvas.toDataURL('image/png');
    };

    const onSave = () => {
        if (!src || !imgRef.current || !done || done.width <= 0 || done.height <= 0) {
            setErr('Please choose an image and make a crop.');
            return;
        }
        const dataURL = cropToDataURL(imgRef.current, done);

        const updated = { ...(user || {}) };
        updated.signature_url = dataURL; // or updated.signature = dataURL
        setUser(updated);
        localStorage.setItem('currentUser', JSON.stringify(updated));

        onClose();
    };

    return (
        <Modal isOpen={open} onOpenChange={onClose} backdrop="transparent" size="4xl" placement="center">
            <ModalContent>
                <ModalHeader>Upload Signature</ModalHeader>
                <ModalBody className="space-y-3">
                    {err && (
                        <div className="rounded border border-red-300 bg-red-50 text-red-800 px-3 py-2 text-sm">
                            {err}
                        </div>
                    )}

                    {!!present && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-700">Current:</span>

                            <img src={present} alt="Current signature" className="max-h-20 border p-1 bg-white" />
                        </div>
                    )}

                    <input id="signature-file" type="file" accept="image/*" onChange={onFile} className="hidden" />
                    <label htmlFor="signature-file" className="inline-flex items-center rounded-md border cursor-pointer px-1 bg-gray-400 hover:bg-black/5 flex-shrink-0 w-20" >
                        Browse…
                    </label>
                    {src ? <span className="inline text-sm text-gray-600">File selected</span> : <span className="text-sm text-gray-400">No file chosen</span>}

                    {src && (
                        <div className="relative w-full max-h-[60vh] overflow-auto rounded border bg-black/5 p-2">
                            <ReactCrop
                                crop={crop}
                                onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
                                onComplete={(pixelCrop, percentCrop) => setDone(pixelCrop)}
                                aspect={aspect}
                                keepSelection
                            >

                                <img
                                    ref={imgRef}
                                    src={src}
                                    alt="To crop"
                                    onLoad={onImageLoad}
                                    className="max-w-full h-auto block"
                                />
                            </ReactCrop>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="flat" onPress={onClose}>Cancel</Button>
                    <Button color="primary" onPress={onSave}>Save</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
