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

import type { MantineThemeOverride } from "@mantine/core";

export const primaryColor = '#19864B';

export const mantineTheme: MantineThemeOverride = {
    cursorType: 'pointer',
    fontFamily: 'inherit',
    lineHeights: {
        xs: 'inherit',
        sm: 'inherit',
        md: 'inherit',
        lg: 'inherit',
        xl: 'inherit',
    },
    components: {
        Tabs: {
            vars: () => ({
                root: {
                    '--tab-radius': '0',
                    '--tabs-color': primaryColor
                }
            })
        },
        Stepper: {
            defaultProps: {
                color: primaryColor,
                allowNextStepsSelect: false
            }
        },
        Slider: {
            defaultProps: {
                color: primaryColor
            }
        },
        Radio: {
            defaultProps: {
                color: primaryColor
            }
        },
        Switch: {
            defaultProps: {
                color: primaryColor
            }
        }
    }
};
