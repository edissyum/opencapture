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

function findLine(zones: any[], lineId: string) {
    for (const zone of zones) {
        const found = zone.lines.find((l: any) => l.id === lineId);
        if (found) return found;
    }
    return null;
}

export function findLineContainingField(zones: any[], fieldId: string) {
    for (const zone of zones) {
        for (const line of zone.lines) {
            if (line.fields.some((f: any) => f.id === fieldId)) return line;
        }
    }
    return null;
}

function findZone(zones: any[], zoneId: string) {
    return zones.find((z) => z.id === zoneId);
}

export function findZoneContainingLine(zones: any[], lineId: string) {
    for (const zone of zones) {
        if (zone.lines.some((l: any) => l.id === lineId)) return zone;
    }
    return null;
}

export function getDropContext(zones: any[], overId: string) {
    if (!overId) return { zone: null, line: null, field: null };

    // cas 1️⃣ : drop sur une zone complète
    if (overId.startsWith("zone-")) {
        return { zone: findZone(zones, overId), line: null, field: null };
    }

    // cas 2️⃣ : drop sur une ligne vide
    const line = findLine(zones, overId);
    if (line) {
        const zone = findZoneContainingLine(zones, line.id);
        return { zone, line, field: null };
    }

    // cas 3️⃣ : drop sur un champ existant
    const containingLine = findLineContainingField(zones, overId);
    const containingZone = findZoneContainingLine(zones, containingLine?.id);
    const field = containingLine?.fields.find((f: any) => f.id === overId);

    return { zone: containingZone, line: containingLine, field };
}

export function recalculateLineIds(zones: any[]) {
    let globalCounter = 1;

    zones.forEach((zone) => {
        zone.lines.forEach((line: { id: string; }) => {
            line.id = `line-${globalCounter++}`;
        });
    });

    return zones;
}

