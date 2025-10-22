
// Helpers
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
