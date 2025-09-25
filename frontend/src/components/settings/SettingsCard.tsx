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

import React from "react";
import { Link } from "react-router-dom";

interface settingCardsProps {
    show?: boolean;
    icon: React.ReactNode;
    title: string;
    description: string;
    to: string;
    className?: string;
}

export function SettingsCard({show = true, icon, title, description, to, className}: settingCardsProps) {
    if (!show) return null;

    return (
        <Link to={ to } className={`${className} flex justify-start items-center min-w-80 p-2.5 pl-4 border-2 border-(--border-secondary) rounded-md hover:border-gray-300 duration-200`}>
            <div className="text-(--text-primary) mr-4 bg-(--bg-secondary) p-2 rounded-md">
                { icon }
            </div>
            <div className="text-(--text-secondary)">
                <h3 className="text-lg font-semibold text-(--text-primary) -mb-1">
                    { title }
                </h3>
                { description }
            </div>
        </Link>
    );
}