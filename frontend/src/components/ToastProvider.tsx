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
import { toast, ToastContainer, type ToastOptions } from "react-toastify";

export const showToast = (message: any, type: "success" | "warning" | "error" | "info" = "success", options?: ToastOptions) => {
    let content: React.ReactNode = message;

    if (typeof message === "string" && message.includes("<")) {
        content = <div dangerouslySetInnerHTML={{ __html: message }} />;
    }

    const autoClose =
        type === "error" ? 8000 :
            type === "warning" ? 5000 :
                type === "success" ? 4000 :
                    4000;

    toast(content, { type, autoClose, toastId: message, ...options });
};

export const ToastProvider: React.FC = () => {
    return (
        <ToastContainer
            closeOnClick
            theme="light"
            pauseOnHover
            className={""}
            pauseOnFocusLoss
            newestOnTop={ true }
            position="top-right"
        />
    );
};
