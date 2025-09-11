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

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
}

export const Input: React.FC<InputProps> = ({
    id,
    label,
    error,
    icon,
    iconPosition = "left",
    className = "",
    ...props
}) => {
    return (
        <div className={`flex flex-col ${className}`}>
            <div className="relative">
                {icon && iconPosition === "left" && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </span>
                )}
                <input
                    id={id}
                    className={`z-10 peer w-full border-b placeholder:text-transparent px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 ${
                        icon ? (iconPosition === "left" ? "pl-10" : "pr-10") : ""
                    } border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                    placeholder=""
                    {...props}
                />
                {label && (
                    <label htmlFor={id} className="cursor-text absolute left-0 ml-2 top-2 -translate-y-5 bg-white px-1 text-sm
                    duration-100 ease-linear peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-base
                    peer-placeholder-shown:text-gray-400 peer-focus:ml-1 peer-focus:-translate-y-5 z-0
                    peer-focus:px-1 peer-focus:text-sm text-gray-900">{label}</label>
                )}
                {icon && iconPosition === "right" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </span>
                )}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};
