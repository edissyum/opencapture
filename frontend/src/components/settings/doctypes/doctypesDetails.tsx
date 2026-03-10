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

import { t } from "i18next";
import { useMemo } from "react";
import { InputSwitch } from "primereact/inputswitch";
import { ChevronRight, FolderOpen } from "lucide-react";

import Input from "../../Input";

export function DoctypeDetails({ selectedDoctype, doctypes, doctypeChanged }: {
    doctypes: any[];
    selectedDoctype: any;
    doctypeChanged: (d: any) => void
}) {
    const info = useMemo(() => {
        if (!selectedDoctype) return null;

        const code = selectedDoctype.code;

        if (code === "root") {
            return {
                parent: null,
                breadcrumb: [{ code: "root", label: "" }],
                children: doctypes.filter(d => d.code.split("-").length === 2)
            };
        }

        // parent
        const parentCode = code.includes("-")
            ? code.split("-").slice(0, -1).join("-")
            : "root";

        const parent = parentCode === "root"
            ? { code: "root", label: "" }
            : doctypes.find(d => d.code === parentCode);

        // enfants directs
        const level = (code.match(/-/g) || []).length;

        const children = doctypes.filter(d =>
            d.code.startsWith(code + "-") &&
            (d.code.match(/-/g) || []).length === level + 1
        );

        // breadcrumb
        const segments = code.split("-");
        const breadcrumb: any[] = [{ code: "root", label: "" }];

        segments.reduce((acc: any, seg: any) => {
            const current = acc ? `${ acc }-${ seg }` : seg;
            const node = doctypes.find(d => d.code === current);
            if (node) breadcrumb.push(node);
            return current;
        }, "");

        return { parent, children, breadcrumb };

    }, [selectedDoctype, doctypes]);

    if (!selectedDoctype) {
        return (
            <div className="p-6 text-(--text-secondary)">
                { t('DOCTYPES.select_doctype') }
            </div>
        );
    }

    return (
        <div className="p-6 flex flex-col gap-6">
            { info?.breadcrumb && (
                <div
                    className="flex w-fit gap-2 text-sm text-(--text-secondary) border-2 border-(--border-secondary) bg-(--bg-primary) rounded-xl p-2">
                    { info.breadcrumb.map((b: any, i: number) => (
                        <span key={ b.code } className={ `flex items-center ${ i === 0 && 'ml-1' }` }>
                            { i > 0 && <ChevronRight size={ 18 }/> }
                            <span className='px-2.5 py-1 rounded-full flex items-center gap-1 bg-transparent transition-colors
                                               hover:bg-(--bg-secondary) cursor-pointer' onClick={ () => doctypeChanged(b) }>
                                { b.type !== "document" && (
                                    <FolderOpen size={ 16 } fill={ 'var(--color-primary)' } stroke={ 'white' }/>
                                ) }
                                { b.label && (
                                    <span className="font-medium text-(--text-primary)">
                                        { b.label }
                                    </span>
                                ) }
                            </span>
                        </span>
                    )) }
                </div>
            ) }

            { selectedDoctype.type === 'document' && (
                <div className="p-4 rounded-xl border-2 border-(--border-secondary) bg-(--bg-primary)">
                    <h3 className='text-lg font-semibold'>
                        { t('DOCTYPES.update_doctype') }
                    </h3>
                    <div className='flex gap-4 mt-4'>
                        <Input className='w-2/3' label={ t('GLOBAL.label') } value={ selectedDoctype.label }/>
                        <Input className='w-1/3' label={ t('ROLES.label_short') } value={ selectedDoctype.key }
                               disabled/>
                    </div>
                    <div className="flex items-center gap-2">
                        <InputSwitch inputId='isDefault' checked={ selectedDoctype.is_default }/>
                        <label htmlFor={ 'isDefault' } className="flex items-center gap-4 cursor-pointer">
                            { t('DOCTYPES.is_default') }
                        </label>
                    </div>
                </div>
            ) }

            {/* Info */ }
            <div>
                <h2 className="text-xl font-semibold">
                    { selectedDoctype.label }
                </h2>

                <div className="text-sm text-(--text-secondary)">
                    Code : { selectedDoctype.code }
                </div>
            </div>

            {/* Parent */ }
            { info?.parent && (
                <div>
                    <h3 className="font-semibold mb-2">Parent</h3>

                    <div className="p-2 rounded bg-(--bg-secondary)">
                        { info.parent.label }
                    </div>
                </div>
            ) }

            {/* Children */ }
            <div>
                <h3 className="font-semibold mb-2">
                    Enfants ({ info?.children.length || 0 })
                </h3>

                { info?.children.length ? (
                    <ul className="flex flex-col gap-1">
                        { info.children.map((child: any) => (
                            <li
                                key={ child.code }
                                className="p-2 rounded bg-(--bg-secondary)"
                            >
                                { child.label }
                            </li>
                        )) }
                    </ul>
                ) : (
                    <span className="text-(--text-secondary)">
                        Aucun enfant
                    </span>
                ) }
            </div>
        </div>
    );
}