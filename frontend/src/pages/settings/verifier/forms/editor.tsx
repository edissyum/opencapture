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

import { t } from "i18next";
import { TabPanel, TabView } from "primereact/tabview";

export function SettingsVerifierFormsEditor() {
    console.log('here')
    return (
        <div className='flex'>
            <div className='border-r-2 border-(--border-secondary) w-full h-full overflow-hidden'>
                <TabView className='h-[calc(100vh-64px)]'>
                    <TabPanel header={ t('SETTINGS.form_details') }>

                    </TabPanel>
                    <TabPanel header={ t('SETTINGS.form_fields') }>

                    </TabPanel>
                </TabView>
            </div>
            <div className='w-[30rem] h-full overflow-hidden'>
                <TabView scrollable className='available_fields h-[calc(100vh-64px)]'>
                    <TabPanel header={ t('ACCOUNTS.suppliers_list') }>

                    </TabPanel>
                    <TabPanel header={ t('VERIFIER.lines') }>

                    </TabPanel>
                    <TabPanel header={ t('VERIFIER.facturation') }>

                    </TabPanel>
                    <TabPanel header={ t('VERIFIER.custom_fields') }>

                    </TabPanel>
                </TabView>
            </div>
        </div>
    );
}