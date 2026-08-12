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
import { PinOff } from "lucide-react";
import { Link } from "react-router-dom";
import { type ReactNode, useState } from "react";

interface settingCardsProps {
    to: string;
    title: string;
    show?: boolean;
    icon: ReactNode;
    module?: string;
    className?: string;
    description: string;
    unpinFav?: () => void;
}

export function SettingsCard({
    show = true,
    icon,
    title,
    description,
    to,
    className,
    module,
    unpinFav
}: settingCardsProps) {
    if (!show) return null;

    const [hovered, setHovered] = useState(false);

    return (
        <Link to={ to } className={ `${ className } relative flex gap-4 justify-start items-center max-w-full p-2 px-3
                                     border border-(--border-secondary) rounded-md hover:border-gray-400 transition-colors` }>
            <div onMouseEnter={ () => setHovered(true) } onMouseLeave={ () => setHovered(false) }
                 className={ `text-(--text-primary) bg-(--bg-secondary) p-2 rounded-md ${ unpinFav && 'hover:bg-(--color-primary)/20' }` }
            >
                { unpinFav && hovered ? (
                    <PinOff
                        data-tooltip-id="tooltip"
                        data-tooltip-content={ t("SETTINGS.remove_favorite") }
                        onClick={ (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (unpinFav) unpinFav();
                    } }/>
                ) : (
                    <>
                        { icon }
                    </>
                ) }
            </div>
            <div className="w-full min-w-0" title={ description }>
                <h3 className="text-lg font-semibold mt-1 text-(--text-primary) flex items-center gap-1 min-w-0">
                    <span className="truncate min-w-0">
                        { title }
                    </span>
                    <span>
                        { module && (
                            <span className="text-[10px] ml-1 text-(--color-primary) absolute top-2 right-2 capitalize">
                                { module }
                            </span>
                        ) }
                    </span>
                </h3>
                <p className='text-(--text-secondary) truncate min-w-0'>
                    { description }
                </p>
            </div>
        </Link>
    );
}