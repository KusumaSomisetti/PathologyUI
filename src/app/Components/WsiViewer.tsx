'use client';

import { useEffect, useId, useRef } from 'react';
import { SearchPlusIcon, SearchMinusIcon, HomeIcon, TvIcon, UndoAltIcon, RedoAltIcon, RulerIcon } from 'react-line-awesome';
type Props = {
    s3Base?: string; // e.g. "https://livo-wsi.s3.ap-south-1.amazonaws.com/image_files"
};

export default function WsiViewer({
    s3Base = 'https://livo-wsi.s3.ap-south-1.amazonaws.com/image_files',
}: Props) {
    // unique ids so multiple viewers can exist on a page
    const uid = useId().replace(/:/g, '');
    const viewerDivId = `wsi-viewer-${uid}`;
    const toolbarId = `wsi-toolbar-controls-${uid}`;
    const id = (k: string) => `${k}-${uid}`;

    const viewerRef = useRef<any | null>(null);
    const initializedRef = useRef(false);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            if (initializedRef.current) return;

            const mod = await import('openseadragon');
            if (cancelled) return;
            const OpenSeadragon: any = (mod as any).default ?? mod;

            const imageWidth = 1944;
            const imageHeight = 1472;
            const width = 96 * imageWidth;
            const height = 96 * imageHeight;

            const host = document.getElementById(viewerDivId);
            if (!host || host.querySelector('.openseadragon-container')) {
                initializedRef.current = true;
                return;
            }

            viewerRef.current = OpenSeadragon({
                id: viewerDivId,
                tileSources: {
                    width,
                    height,
                    tileWidth: imageWidth,
                    tileHeight: imageHeight,
                    minLevel: 3,
                    maxLevel: 7,
                    tileOverlap: 0,
                    getTileUrl: (level: number, x: number, y: number) =>
                        `${s3Base}/${level}/Img_${y}_${x}.jpg`,
                },
                toolbar: toolbarId,
                defaultZoomLevel: 2,
                showNavigator: true,
                navigatorAutoFade: false,
                rulerButton: id('ruler'),
                zoomInButton: id('zoom-in'),
                zoomOutButton: id('zoom-out'),
                homeButton: id('home'),
                fullPageButton: id('fullscreen'),
                rotateLeftButton: id('rotate-left'),
                rotateRightButton: id('rotate-right'),
            });

            initializedRef.current = true;
        })();

        return () => {
            cancelled = true;
            try { viewerRef.current?.destroy(); } catch { }
            viewerRef.current = null;
            initializedRef.current = false;
        };
    }, [s3Base, toolbarId, viewerDivId]);

    const btn = 'px-2 py-1 text-xs rounded border hover:bg-black/5 active:scale-95';

    return (
        <div className="w-full">
            <div className="relative w-full">

                <div id={viewerDivId} className="h-[90vh] w-full bg-gray-800/60 rounded border" />

                <div className="absolute top-2 left-2 z-20 pointer-events-none">
                    <div id={toolbarId}
                        className="pointer-events-auto flex items-center gap-1 rounded-xl border border-black/10 bg-white/95 shadow-lg px-2 py-1 text-black">
                        <button id={id('ruler')} className="p-1"><RulerIcon size="2x" /></button>
                        <button id={id('zoom-in')} className="p-1"><SearchPlusIcon size="2x" /></button>
                        <button id={id('zoom-out')} className="p-1"><SearchMinusIcon size="2x" /></button>
                        <button id={id('home')} className="p-1"><HomeIcon size="2x" /></button>
                        <button id={id('fullscreen')} className="p-1"><TvIcon size="2x" /></button>
                        <button id={id('rotate-left')} className="p-1"><UndoAltIcon size="2x" /></button>
                        <button id={id('rotate-right')} className="p-1"><RedoAltIcon size="2x" /></button>
                    </div>
                </div>


            </div>
        </div>

    );
}
