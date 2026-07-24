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

import React, { useState } from "react";

export function useFloatingLabel(hasValue: boolean) {
    const [focused, setFocused] = useState(false);
    const floating = focused || hasValue;

    return {
        floating,
        onFocus: () => setFocused(true),
        onBlur: () => setFocused(false)
    };
}

interface FloatingLabelProps {
    htmlFor?: string;
    floating: boolean;
    required?: boolean;
    className?: string;
    children: React.ReactNode;
}

export const FloatingLabel: React.FC<FloatingLabelProps> = ({
    htmlFor,
    floating,
    required,
    children,
    className = ''
}) => (
    <label
        htmlFor={ htmlFor }
        className={ `${ className } absolute left-3 select-none pointer-events-none transition-all duration-150
            ${ floating ? 'top-0 -translate-y-1/2 px-1 text-xs bg-(--bg-primary) text-(--text-secondary)' 
            : 'top-1/2 -translate-y-1/2 text-(--text-secondary)' }` }
    >
        { children }
        { required && <span className="text-(--text-error) ml-1">*</span> }
    </label>
);
