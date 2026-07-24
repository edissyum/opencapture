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

export function Panel({ header, children }: { header: React.ReactNode; children: React.ReactNode }) {
    return (
        <div>
            <div className='bg-(--bg-primary) p-4 border border-b-0 border-(--border-secondary) rounded-t-xl'>
                { header }
            </div>
            <div className='bg-(--bg-primary) border border-(--border-secondary) rounded-b-xl'>
                <div>{children}</div>
            </div>
        </div>
    );
}