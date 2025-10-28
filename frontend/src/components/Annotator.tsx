import React, { useEffect, useRef, useState } from "react";

interface Region {
    id: string;
    x: number;
    y: number;
    page?: number;
    color: string;
    width: number;
    height: number;
    label: string;
}

interface AnnotatorProps {
    alt?: string;
    width: string;
    regionsList: Region[];
    imageB64: string;
    focusedField: { id: string; label: string; color: string } | null;
    onChange?: (regions: Region[]) => void;
    onEnd?: () => void;
}

export function Annotator({ regionsList, alt, width, focusedField, imageB64, onChange, onEnd }: AnnotatorProps) {
    const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (!imgRef.current) return;
        const updateSize = () => {
            setImgSize({
                w: imgRef.current!.clientWidth,
                h: imgRef.current!.clientHeight,
            });
        };
        updateSize();
        const observer = new ResizeObserver(updateSize);
        observer.observe(imgRef.current);
        return () => observer.disconnect();
    }, [imageB64, width]);

    const [regions, setRegions] = useState<Region[]>([]);
    if (regions.length === 0 && regionsList.length > 0) {
        setRegions(regionsList);
    }
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    const [isMoving, setIsMoving] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    const [resizeTarget, setResizeTarget] = useState<{ id: string; corner: string } | null>(null);
    const [moveTarget, setMoveTarget] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);

    useEffect(() => {
        if (onChange) onChange(regions);
    }, [regions]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();

        const scrollLeft = containerRef.current.scrollLeft;
        const scrollTop = containerRef.current.scrollTop;

        const x = e.clientX - rect.left + scrollLeft;
        const y = e.clientY - rect.top + scrollTop;

        if ((e.target as HTMLElement).dataset.handle) return;

        const clickedRegion = regions.find(
            (r) => x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height
        );

        if (!focusedField && !clickedRegion) {
            return;
        }

        if (clickedRegion) {
            setIsMoving(true);
            setMoveTarget({
                id: clickedRegion.id,
                offsetX: x - clickedRegion.x,
                offsetY: y - clickedRegion.y,
            });
            return;
        }

        if (focusedField) {
            setRegions((prev) => prev.filter((r) => r.id !== focusedField.id));
        }

        setStartPos({ x, y });
        setIsDrawing(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        const scrollLeft = containerRef.current.scrollLeft;
        const scrollTop = containerRef.current.scrollTop;

        const currentX = e.clientX - rect.left + scrollLeft;
        const currentY = e.clientY - rect.top + scrollTop;

        if (isMoving && moveTarget) {
            setRegions((prev) =>
                prev.map((r) => {
                    if (r.id !== moveTarget.id) return r;

                    const draftRegion = {
                        x: currentX - moveTarget.offsetX,
                        y: currentY - moveTarget.offsetY,
                        width: r.width,
                        height: r.height,
                    };

                    const clamped = clampRegionToImage(draftRegion);

                    return {
                        ...r,
                        x: clamped.x,
                        y: clamped.y,
                        width: clamped.width,
                        height: clamped.height,
                    };
                })
            );
            return;
        }

        if (isResizing && resizeTarget) {
            setRegions((prev) =>
                prev.map((r) => {
                    if (r.id !== resizeTarget.id) return r;

                    // on calcule une nouvelle boîte brute
                    let newRegion = { x: r.x, y: r.y, width: r.width, height: r.height };

                    switch (resizeTarget.corner) {
                        case "top-left":
                            newRegion.width += newRegion.x - currentX;
                            newRegion.height += newRegion.y - currentY;
                            newRegion.x = currentX;
                            newRegion.y = currentY;
                            break;
                        case "top-right":
                            newRegion.width = currentX - newRegion.x;
                            newRegion.height += newRegion.y - currentY;
                            newRegion.y = currentY;
                            break;
                        case "bottom-left":
                            newRegion.width += newRegion.x - currentX;
                            newRegion.x = currentX;
                            newRegion.height = currentY - newRegion.y;
                            break;
                        case "bottom-right":
                            newRegion.width = currentX - newRegion.x;
                            newRegion.height = currentY - newRegion.y;
                            break;
                    }

                    // 🧲 clamp dans l'image
                    const clamped = clampRegionToImage(newRegion);

                    return {
                        ...r,
                        x: clamped.x,
                        y: clamped.y,
                        width: clamped.width,
                        height: clamped.height,
                    };
                })
            );
            return;
        }

        if (!isDrawing || !focusedField) return;

        const rawRegion = {
            x: Math.min(startPos.x, currentX),
            y: Math.min(startPos.y, currentY),
            width: Math.abs(currentX - startPos.x),
            height: Math.abs(currentY - startPos.y),
        };

        const clamped = clampRegionToImage(rawRegion);

        const newRegion: Region = {
            id: focusedField.id,
            x: clamped.x,
            y: clamped.y,
            width: clamped.width,
            height: clamped.height,
            label: focusedField.label,
            color: focusedField.color,
        };

        setRegions((prev) => [...prev.filter((r) => r.id !== focusedField.id), newRegion]);
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
        setIsResizing(false);
        setResizeTarget(null);
        setIsMoving(false);
        setMoveTarget(null);
        if (onEnd) onEnd();
    };

    const handleDelete = (id: string) => {
        setRegions((prev) => prev.filter((r) => r.id !== id));
    };

    const handleResizeStart = (e: React.MouseEvent, id: string, corner: string) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);
        setResizeTarget({ id, corner });
    };

    function clampRegionToImage(region: { x: number; y: number; width: number; height: number }) {
        let x = region.x;
        let y = region.y;
        let w = region.width;
        let h = region.height;

        if (w < 0) {
            x = x + w;
            w = Math.abs(w);
        }
        if (h < 0) {
            y = y + h;
            h = Math.abs(h);
        }

        // clamp à 0
        if (x < 0) x = 0;
        if (y < 0) y = 0;

        // clamp à la largeur/hauteur de l'image affichée
        if (x + w > imgSize.w) {
            w = imgSize.w - x;
        }
        if (y + h > imgSize.h) {
            h = imgSize.h - y;
        }

        // sécurité si l'image ne connaît pas encore sa taille
        if (!imgSize.w || !imgSize.h) {
            return { x, y, width: w, height: h };
        }

        return { x, y, width: w, height: h };
    }

    return (
        <div className="flex flex-col items-center h-full gap-4">
            <div
                ref={ containerRef }
                className={ `relative overflow-auto w-full h-full ${
                    focusedField ? "cursor-crosshair" : ""
                }` }
                onMouseDown={ handleMouseDown }
                onMouseMove={ handleMouseMove }
                onMouseUp={ handleMouseUp }
            >
                <img ref={ imgRef }
                     alt={ alt }
                     src={ imageB64 }
                     draggable={ false }
                     style={ { width: width, maxWidth: width } }
                     className="h-auto block pointer-events-none select-none"
                />

                { regions.map((r) => (
                    <div
                        key={ r.id }
                        style={ {
                            left: r.x,
                            top: r.y,
                            width: r.width,
                            height: r.height,
                            borderColor: r.color,
                            backgroundColor: r.color + "1A",
                        } } className="annotation absolute border rounded-md cursor-move rounded-tr-none z-10">
                        <div className="absolute -top-6.5 -right-px bg-(--bg-primary) text-xs select-none p-1 border
                                       rounded-md rounded-br-none flex items-center z-20 whitespace-nowrap font-semibold"
                             style={ { borderColor: r.color, color: r.color } }>
                            <span>{ r.label }</span>
                            <button onClick={ () => handleDelete(r.id) } className="ml-1 cursor-pointer">
                                ✕
                            </button>
                        </div>

                        { ["top-left", "top-right", "bottom-left", "bottom-right"].map((corner) => (
                            <div
                                key={ corner }
                                data-handle
                                onMouseDown={ (e) => handleResizeStart(e, r.id, corner) }
                                style={ {
                                    position: "absolute",
                                    width: "10px",
                                    height: "10px",
                                    cursor:
                                        corner === "top-left"
                                            ? "nw-resize"
                                            : corner === "top-right"
                                                ? "ne-resize"
                                                : corner === "bottom-left"
                                                    ? "sw-resize"
                                                    : "se-resize",
                                    left: corner.includes("left") ? "-5px" : "calc(100% - 5px)",
                                    top: corner.includes("top") ? "-5px" : "calc(100% - 5px)",
                                } }
                            />
                        )) }
                    </div>
                )) }
            </div>
        </div>
    );
}
