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

type ButtonSize = "sm" | "md" | "lg";
type ButtonVariant = "primary" | "secondary" | "danger" | "no_bg" | "no_bg_border" | "bg_white_rounded" | "bg_white";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    to?: string;
    exact?: boolean;
    size?: ButtonSize;
    loading?: boolean;
    selected?: boolean;
    icon?: React.ReactNode;
    variant?: ButtonVariant;
}

export function Button({
    to,
    icon,
    disabled,
    children,
    selected,
    className,
    size = "md",
    exact = false,
    loading = false,
    type = "button",
    variant = "primary",
    ...props
}: ButtonProps) {
    let isActive = false;
    if (to) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const location = useLocation();
        isActive = exact ? location.pathname === to : location.pathname.includes(to)
    }

    let baseStyles =
        "cursor-pointer inline-flex gap-2 items-center justify-center font-normal " +
        "transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

    if (!className?.includes('rounded-')) {
        baseStyles += ' rounded-lg'
    }

    const variantStyles: Record<ButtonVariant, string> = {
        primary: "bg-(--color-primary) border border-(--border-primary) text-white hover:bg-(--bg-selected) hover:text-(--color-primary)",
        secondary: "bg-(--bg-selected) border border-(--border-primary) text-(--color-primary) hover:bg-(--color-primary) hover:text-white",
        danger: "bg-(--text-error) border border-(--text-error) text-white hover:bg-(--text-error)/10 hover:text-(--text-error)",
        no_bg: "bg-transparent text-(--text-secondary) hover:border hover:border-(--text-secondary) border border-transparent",
        bg_white: "bg-(--bg-primary) text-(--text-secondary) border border-(--border-secondary) hover:bg-(--border-secondary)/10",
        bg_white_rounded: "rounded-3xl! hover:text-(--color-primary) text-(--text-primary) border border-(--border-secondary) hover:border-(--color-primary) bg-(--bg-primary) p-2! px-5!",
        no_bg_border: "bg-transparent text-(--text-secondary) border border-(--border-secondary) hover:bg-(--text-secondary)/10",
    };

    const variantSelectedStyles: Record<ButtonVariant, string> = {
        primary: "bg-(--bg-selected) border border-(--border-primary) text-(--color-primary) hover:bg-(--color-primary) hover:text-white",
        secondary: "bg-(--color-primary) border border-(--border-primary) text-white hover:bg-(--bg-selected) hover:text-(--color-primary)",
        danger: "bg-(--text-error) border border-(--text-error) text-white hover:bg-(--text-error)/10 hover:text-(--text-error)",
        no_bg: "bg-transparent text-(--color-secondary) hover:border hover:border-(--text-secondary) border border-transparent",
        bg_white: "bg-(--bg-primary) text-(--text-secondary) border border-(--border-secondary) hover:bg-(--border-secondary)/10",
        bg_white_rounded: "bg-(--color-primary)! border border-(--border-primary)! text-white! hover:bg-(--bg-selected)! hover:text-(--color-primary)!",
        no_bg_border: "bg-transparent text-(--text-secondary) border border-(--border-secondary) hover:bg-(--text-secondary"
    }

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
    if (className?.includes('font-')) {
        baseStyles = baseStyles.replace(/font-[^\s]+/gm, '');
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

    if (selected) {
        classes = classes + " " + variantSelectedStyles[variant];
    }

    const content = loading ? (
        <LoaderCircle className="animate-spin" size={ 24 }/>
    ) : (
        <>
            { icon && <span>{ icon }</span> }
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
