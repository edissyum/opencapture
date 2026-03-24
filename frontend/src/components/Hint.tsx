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

import { OctagonX, TriangleAlert } from "lucide-react";

export default function Hint({ children, variant = "success" }: any) {
    if (!children) return null;

    const baseClasses = "p-4 border-2 border-r-0 border-b-0 border-t-0 font-semibold";
    const variants: any = {
        success: "bg-(--bg-selected) border-(--border-primary)",
        warning: "bg-yellow-500/10 border-yellow-500",
        error: "bg-(--text-error)/10 border-(--text-error)"
    };
    const textVariants: any = {
        success: "text-(--color-primary)",
        warning: "text-yellow-700",
        error: "text-(--text-error)"
    };

    const logoVariants: any = {
        success: "",
        error: <OctagonX className={ `${ textVariants[variant] } mr-2` }/>,
        warning: <TriangleAlert className={ `${ textVariants[variant] } mr-2` }/>,
    };

    return (
        <span className={ `${ baseClasses } ${ variants[variant] } flex items-center gap-1 mb-4` }>
            { logoVariants[variant] } { children }
        </span>
    );
}
