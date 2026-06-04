/** This file is part of Open-Capture.

 Open-Capture is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Open-Capture is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Open-Capture. If not, see <https://www.gnu.org/licenses/gpl-3.0.html>.

 @dev : Nathan CHEVAL <nathan.cheval@edissyum.com> */

import React, { useEffect, useRef, useState } from "react";
import { t } from "i18next";

export interface Region {
    id: string;
    x: number;
    y: number;
    page: number;
    color: string;
    width: number;
    height: number;
    label: string;
}

interface AnnotatorProps {
    alt?: string;
    width?: string;
    imageB64: string;
    disabled?: boolean;
    currentPage?: number;
    regionsList: Region[];
    originalWidth?: number;
    focusedField: { id: string; label: string; color: string } | null;
    onDelete?: (id: string) => void;
    onEnd?: (activeRegion: any, regions: Region[]) => void;
}

export function Annotator({
                              alt,
                              imageB64,
                              regionsList,
                              currentPage,
                              focusedField,
                              originalWidth,
                              width = "100%",
                              disabled = true,
                              onEnd,
                              onDelete
                          }: AnnotatorProps) {
    const [ratio, setRatio] = useState(0);
    const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

    const [regions, setRegions] = useState<Region[]>([]);
    const [regionsOriginalSize, setRegionsOriginalSize] = useState<Region[]>([]);

    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!imgRef.current) return;
        const updateSize = () => {
            if (!imgRef.current) return;

            setImgSize({
                w: imgRef.current!.clientWidth,
                h: imgRef.current!.clientHeight,
            });
            setRatio(originalWidth ? originalWidth / imgRef.current!.clientWidth : 1);
        };
        updateSize();
        const observer = new ResizeObserver(updateSize);
        observer.observe(imgRef.current);
        return () => observer.disconnect();
    }, [imageB64, width]);

    // Initialize regions from regionsList on first load
    useEffect(() => {
        if (regions.length === 0 && regionsList.length > 0 && ratio > 0) {
            // We adjust the regions according to the ratio
            // We add 5px to width and height to avoid cutting off borders
            // We subtract 2.5px to x and y to center the region
            setRegions(regionsList.map(r => ({
                ...r,
                page: r.page,
                x: r.x / ratio - 2.5,
                y: r.y / ratio - 2.5,
                width: r.width / ratio + 5,
                height: r.height / ratio + 5
            })));
        }
    }, [regionsList, imgSize]);

    // Update regions when ratio changes
    useEffect(() => {
        if (regionsOriginalSize.length === 0 || ratio === 0) return;

        const updatedRegions = regionsOriginalSize.map(r => ({
            ...r,
            x: r.x / ratio,
            y: r.y / ratio,
            width: r.width / ratio,
            height: r.height / ratio,
        }));

        setRegions(updatedRegions);
    }, [ratio]);

    // Update regionsOriginalSize when regions change
    useEffect(() => {
        if (regions.length === 0 || ratio === 0) return;

        const originals = regions.map(r => ({
            ...r,
            x: Math.round(r.x * ratio),
            y: Math.round(r.y * ratio),
            width: Math.round(r.width * ratio),
            height: Math.round(r.height * ratio)
        }));

        setRegionsOriginalSize(originals);
    }, [regions, ratio]);

    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [activeRegion, setActiveRegion] = useState<string | null>(null);

    const [isMoving, setIsMoving] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isResizing, setIsResizing] = useState(false);

    const [resizeTarget, setResizeTarget] = useState<{ id: string; corner: string } | null>(null);
    const [moveTarget, setMoveTarget] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);

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
            setActiveRegion(clickedRegion.id);
            setIsMoving(true);
            setMoveTarget({
                id: clickedRegion.id,
                offsetX: x - clickedRegion.x,
                offsetY: y - clickedRegion.y,
            });
            return;
        }

        if (focusedField) {
            setActiveRegion(focusedField.id);
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

                    // Calculate a new raw box
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

                    // clamp in the image
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
            page: currentPage || 1,
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
        if (onEnd) onEnd(activeRegion, regionsOriginalSize);
    };

    const handleDelete = (id: string) => {
        setRegions((prev) => prev.filter((r) => r.id !== id));
        if (onDelete) onDelete(id);
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

        // Clamp to 0,0
        if (x < 0) x = 0;
        if (y < 0) y = 0;

        // clamp to the width/height of the displayed image
        if (x + w > imgSize.w) {
            w = imgSize.w - x;
        }
        if (y + h > imgSize.h) {
            h = imgSize.h - y;
        }

        // safety if the image size is not yet known
        if (!imgSize.w || !imgSize.h) {
            return { x, y, width: w, height: h };
        }

        return { x, y, width: w, height: h };
    }

    return (
        <div className="flex flex-col items-center h-full gap-4 annotator">
            <div
                ref={ containerRef }
                onMouseUp={ !disabled ? handleMouseUp : undefined }
                onMouseDown={ !disabled ? handleMouseDown : undefined }
                onMouseMove={ !disabled ? handleMouseMove : undefined }
                className={ `relative overflow-auto w-full h-full ${ focusedField && !disabled && "cursor-crosshair" }` }
            >
                <img
                    alt={ alt }
                    ref={ imgRef }
                    src={ imageB64 }
                    draggable={ false }
                    style={ { width: width, maxWidth: width } }
                    className="h-auto block pointer-events-none select-none rounded-xl"
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
                            display: (currentPage && r.page !== currentPage) ? "none" : "block",
                            boxShadow: focusedField?.id == r.id ? "1px 1px 2px 2px" + r.color + "4A" : "none"
                        } }
                        className={ `annotation absolute border rounded-md rounded-tr-none z-10 transition-transform
                                     ${ disabled ? 'cursor-not-allowed' : 'cursor-move' }
                                     ${ focusedField?.id == r.id && !isMoving && !isDrawing && !isResizing && "scale-105" } ` }
                    >
                        <div className="absolute -top-6.5 -right-px bg-(--bg-primary) text-xs select-none p-1 border
                                       rounded-md rounded-br-none flex items-center z-20 whitespace-nowrap font-semibold"
                             style={ { borderColor: r.color, color: r.color } }>
                            <span>{ t(r.label) }</span>
                            { !disabled && (
                                <button onClick={ () => handleDelete(r.id) } className="ml-1 cursor-pointer">
                                    ✕
                                </button>
                            ) }
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
