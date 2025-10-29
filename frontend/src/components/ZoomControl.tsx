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

import { Slider } from "primereact/slider";
import { Minus, Plus } from "lucide-react";

export function ZoomControl({ zoom, setZoom }: any) {
    const handleZoomChange = (value: number | number[]) => {
        const z = Array.isArray(value) ? value[0] : value;
        setZoom(z);
    };

    return (
        <div
            className="flex items-center gap-3 select-none w-full">
            <Minus size={ 20 } onClick={ () => setZoom((z: number) => Math.max(z - 10, 100)) }/>

            <Slider
                value={ zoom }
                onChange={ (e) => handleZoomChange(e.value) }
                min={ 100 }
                max={ 200 }
                step={ 10 }
                className="w-full"
            />

            <Plus size={ 20 } onClick={ () => setZoom((z: number) => Math.min(z + 10, 200)) }/>

            <span className="text-sm font-medium w-12 text-center text-(--text-primary)">
                { zoom }%
            </span>
        </div>
    );
}
