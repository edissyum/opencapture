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
import { Link, useLocation } from "react-router-dom";

type ButtonVariant = "primary" | "secondary" | "danger" | "no_bg";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: React.ReactNode;
    loading?: boolean;
    to?: string;
    exact?: boolean;
}

export function Button({
    children,
    type = "button",
    variant = "primary",
    size = "md",
    loading = false,
    icon,
    className,
    to,
    disabled,
    exact = false,
    ...props
}: ButtonProps) {
    const location = useLocation();

    const isActive = to
        ? exact
            ? location.pathname === to
            : location.pathname.includes(to)
        : false;

    const baseStyles =
        "cursor-pointer inline-flex items-center justify-center font-medium rounded-lg " +
        "transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

    const variantStyles: Record<ButtonVariant, string> = {
        primary: "bg-green-400 border-2 border-(--border-primary) text-white hover:bg-green-400/10 hover:text-(--color-primary)!",
        secondary: "bg-green-400/10 border-2 border-(--border-primary) rounded-lg text-(--color-primary)! hover:bg-green-400 hover:text-white!",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        no_bg: "bg-transparent text-gray-400! hover:bg-(--bg-secondary) hover:text-gray-200 hover:border-2 hover:border-gray-400 border-2 border-transparent",
    };

    const sizeStyles: Record<ButtonSize, string> = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-5 py-3 text-lg",
    };

    if (to) {
        variant = isActive ? "secondary" : "no_bg";
    }

    let classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`;
    if (className) {
        classes = classes + " " + className;
    }

    const content = loading ? (
        <LoaderCircle className="animate-spin" size={24} />
    ) : (
        <>
            { icon && <span className="mr-2">{icon}</span> }
            { children }
        </>
    );

    if (to) {
        const isExternal = to.startsWith("http");
        if (isExternal) {
            return (
                <a href={to} className={classes} target="_blank" rel="noopener noreferrer">
                    {content}
                </a>
            );
        }
        return (
            <Link to={to} className={classes}>
                {content}
            </Link>
        );
    }

    return (
        <div className={`${disabled ? "cursor-not-allowed" : ""}`}>
            <button className={classes} disabled={disabled} type={type} {...props}>
                {content}
            </button>
        </div>
    );
}
