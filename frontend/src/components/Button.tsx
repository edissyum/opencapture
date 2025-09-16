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
import { LoaderCircle } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: React.ReactNode;
    loading?: boolean;
}

export function Button({
    children,
    type = "button",
    variant = "primary",
    size = "md",
    loading = false,
    icon,
    className,
    ...props
}: ButtonProps) {
    const baseStyles =
        "cursor-pointer inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none " +
        "focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variantStyles: Record<ButtonVariant, string> = {
        primary: "bg-green-400 text-white hover:bg-green-400/80 focus:ring-green-500",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };

    const sizeStyles: Record<ButtonSize, string> = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-5 py-3 text-lg",
    };

    let classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`;
    if (className) {
        classes =  classes + " " + className;
    }

    return (
        <span className="disabled:cursor-not-allowed">
            <button className={classes} type={type} {...props}>
                {loading ? (
                    <LoaderCircle className="animate-spin" size={24} />
                ) : (
                    <>
                        {icon && <span className="mr-2">{icon}</span>}
                        {children}
                    </>
                )}
            </button>
        </span>
    );
}
