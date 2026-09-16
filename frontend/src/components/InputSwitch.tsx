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
import { Switch } from "@mantine/core";

export function InputSwitch({ id, label, checked, disabled, onChange, truncate }: {
    id: string;
    label?: string;
    checked: boolean;
    truncate?: boolean;
    disabled?: boolean;
    onChange: (value: boolean) => void;
}) {

    const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.checked);
    }

    return (
        <Switch
            id={ id }
            key={ id }
            label={ label }
            title={ truncate ? label : undefined }
            checked={ checked }
            disabled={ disabled }
            onChange={ handleOnChange }
            withThumbIndicator={ false }
            classNames={ truncate ? {
                root: 'min-w-0 flex-1',
                label: 'truncate block',
                labelWrapper: 'min-w-0 flex-1 overflow-hidden'
            } : undefined }
        />
    )
}