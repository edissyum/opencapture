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

import React, { createContext, useContext } from "react";

const CustomContext = createContext<string | null>(null);

export const useCustom = () => useContext(CustomContext);

export const CustomProvider: React.FC<{
    custom: string | null;
    children: React.ReactNode;
}> = ({ custom, children }) => (
    <CustomContext.Provider value={custom}>{children}</CustomContext.Provider>
);