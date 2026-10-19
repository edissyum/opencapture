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

import { FileBadge, Folder, FolderOpen, File } from "lucide-react";

export type DoctypeTreeNode = {
    key: string;
    label?: string;
    data: any;
    children?: DoctypeTreeNode[];
    leaf?: boolean;
};

export type ExpandedKeysType = Record<string, boolean>;

export function normalizeValue(v: string) {
    return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function buildTree(items: any, level = "0") {
    return items.filter((o: any) =>
        o.code.startsWith(level + "-") &&
        (o.code.match(/-/g) || []).length === (level.match(/-/g) || []).length + 1
    ).map((o: any) => ({
        ...o,
        children: buildTree(items, o.code),
    }));
}

export function buildDoctypesTree(items: any[], level = "0"): DoctypeTreeNode[] {
    return items.filter(o =>
        o.code.startsWith(level + "-") &&
        (o.code.match(/-/g) || []).length === (level.match(/-/g) || []).length + 1
    ).map(o => {
        const children = buildDoctypesTree(items, o.code);
        return {
            key: o.code,
            label: o.label,
            data: o,
            children: children.length ? children : undefined,
            leaf: o.type !== "folder",
        };
    });
}

export function collectExpanded(nodes: DoctypeTreeNode[]) {
    const keys: ExpandedKeysType = {};

    const walk = (ns: DoctypeTreeNode[]) =>
        ns.forEach(n => {
            if (n.children?.length) {
                keys[n.key] = true;
                walk(n.children);
            }
        });

    walk(nodes);
    return keys;
}


export function makeNodeTemplate(searchText: string, expandedKeys: ExpandedKeysType) {
    return (node: DoctypeTreeNode) => {
        const doctype = node.data;
        const isFolder = doctype.type === "folder" || doctype.type === "root";
        const isExpanded = isFolder && expandedKeys[node.key];

        const renderLabel = () => {
            if (!searchText) return doctype.label;

            const norm = normalizeValue(doctype.label);
            const normS = normalizeValue(searchText);
            const idx = norm.indexOf(normS);

            if (idx === -1) return doctype.label;

            return (
                <>
                    { doctype.label.slice(0, idx) }
                    <mark className="bg-yellow-700 text-white rounded p-0.5">
                        { doctype.label.slice(idx, idx + searchText.length) }
                    </mark>
                    { doctype.label.slice(idx + searchText.length) }
                </>
            );
        };

        return (
            <div className="flex items-center min-w-0 ml-1 gap-1" title={ doctype.label }>
                <span className="shrink-0 icons">
                    { isFolder ? (
                        isExpanded ? <FolderOpen stroke={ 'white' } fill={ 'var(--color-primary)' } size={ 16 }/> :
                            <Folder stroke={ 'white' } fill={ 'var(--color-primary)' } size={ 16 }/>
                    ) : (
                        doctype.is_default ? <FileBadge size={ 16 }/> : <File size={ 16 }/>
                    ) }
                </span>

                <span className="truncate text-sm" style={ { fontWeight: isFolder ? 600 : 400 } }>
                    { renderLabel() }
                </span>
            </div>
        );
    };
}