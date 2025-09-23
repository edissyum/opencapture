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
import { Check } from "lucide-react";

interface CheckOverlayProps {
    show?: boolean;
}

export const CheckOverlay: React.FC<CheckOverlayProps> = ({ show = true }) => {
    if (!show) return null;

    return (
        <div className="z-1 absolute -top-4.5 -right-4.5 m-2 w-6 h-6 rounded-full bg-(--color-primary) flex items-center justify-center text-white">
            <Check size={15}/>
        </div>
    );
};
