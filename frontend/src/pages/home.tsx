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

import { useEffect, useState } from "react";

export function HomePage() {
    const [module, setModule] = useState("");

    const selectedModule = localStorage.getItem('selectedModule');
    if (selectedModule && selectedModule !== module) {
        setModule(selectedModule);
    }

    useEffect(() => {
        const handler = () => {
            const module = localStorage.getItem('selectedModule');
            if (module) {
                setModule(module);
            }
        };

        window.addEventListener("local-storage", handler);
        return () => window.removeEventListener("local-storage", handler);
    }, []);


    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">HOME</h1>
            <p>Module selectionné : {module}</p>
        </div>
    );
}