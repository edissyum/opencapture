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

type ButtonVariant = "primary" | "secondary" | "danger" | "no_bg" | "no_bg_border" | "bg_white_rounded" | "bg_white";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    to?: string;
    exact?: boolean;
    size?: ButtonSize;
    loading?: boolean;
    icon?: React.ReactNode;
    variant?: ButtonVariant;
}

export function Button({
    to,
    icon,
    disabled,
    children,
    className,
    size = "md",
    exact = false,
    loading = false,
    type = "button",
    variant = "primary",
    ...props
}: ButtonProps) {
    const location = useLocation();

    const isActive = to
        ? exact
            ? location.pathname === to
            : location.pathname.includes(to)
        : false;

    let baseStyles =
        "cursor-pointer inline-flex items-center justify-center font-medium " +
        "transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

    if (!className?.includes('rounded-')) {
        baseStyles += ' rounded-lg'
    }

    const variantStyles: Record<ButtonVariant, string> = {
        primary: "bg-(--color-primary) border-2 border-(--border-primary) text-white hover:bg-(--bg-selected) hover:text-(--color-primary)",
        secondary: "bg-(--bg-selected) border-2 border-(--border-primary) text-(--color-primary) hover:bg-(--color-primary) hover:text-white",
        danger: "bg-(--text-error) border-2 border-(--text-error) text-white hover:bg-(--text-error)/10 hover:text-(--text-error)",
        no_bg: "bg-transparent text-(--text-secondary) hover:border-2 hover:border-(--text-secondary) border-2 border-transparent",
        bg_white: "bg-(--bg-primary) text-(--text-secondary) border-1 border-(--border-secondary) hover:bg-(--border-secondary)/10",
        bg_white_rounded: "rounded-3xl! hover:text-(--color-primary) text-(--text-primary) border-2 border-(--border-secondary) bg-(--bg-primary) p-2! px-5!",
        no_bg_border: "bg-transparent text-(--text-secondary) border-1 border-(--text-secondary) hover:bg-(--text-secondary)/10",
    };

    if (className?.includes('text-')) {
        variantStyles[variant] = variantStyles[variant].replace('text-white', '');
        variantStyles[variant] = variantStyles[variant].replace(/(text-\(|hover:text-)[^\s)]+\)?/gm, '');
    }
    if (className?.includes('bg-')) {
        variantStyles[variant] = variantStyles[variant].replace(/(bg-\(|hover:bg-)[^\s)]+/gm, '');
    }
    if (className?.includes('border-')) {
        variantStyles[variant] = variantStyles[variant].replace(/(border-\(|hover:border-)[^\s)]+/gm, '');
    }

    const sizeStyles: Record<ButtonSize, string> = {
        sm: "p-1.5 text-sm",
        md: "py-2.5 px-8 text-base",
        lg: "p-3.5 text-lg",
    };

    if (to) {
        variant = isActive ? "secondary" : "no_bg";
    }

    let classes = `${ baseStyles } ${ variantStyles[variant] } ${ sizeStyles[size] }`;
    if (className) {
        classes = classes + " " + className;
    }

    const content = loading ? (
        <LoaderCircle className="animate-spin" size={ 24 }/>
    ) : (
        <>
            { icon && <span className="mr-2">{ icon }</span> }
            { children }
        </>
    );

    if (to) {
        const isExternal = to.startsWith("http");
        if (isExternal) {
            return (
                <a href={ to } className={ classes } target="_blank" rel="noopener noreferrer">
                    { content }
                </a>
            );
        }
        return (
            <Link to={ to } className={ 'appearance-none ' + classes }>
                { content }
            </Link>
        );
    }

    return (
        <div className={ `${ disabled ? "cursor-not-allowed" : "" }` }>
            <button className={ classes } disabled={ disabled } type={ type } { ...props }>
                { content }
            </button>
        </div>
    );
}
