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
import { BrainCog, CodeXml, Flag, FolderOutput, LayoutTemplate, QrCode, ShieldCheck, Workflow } from "lucide-react";

import { useUser } from "../../../services/hooks/useUser";

import { Loader } from "../../../components/loader/Loader";
import { hasRequiredPermissions } from "../../../components/auth/auth";
import { SettingsCard } from "../../../components/settings/SettingsCard";

export const getSettingsSplitterOptions = () => [
    {
        name: t('SETTINGS.forms'),
        description: t('SETTINGS.forms_description'),
        icon: <LayoutTemplate/>,
        href: '/settings/splitter/forms',
        privileges: ['forms_list_splitter'],
        module: 'splitter'
    },
    {
        name: t('VERIFIER.custom_fields'),
        description: t('SETTINGS.custom_fields_description'),
        icon: <CodeXml/>,
        href: '/settings/splitter/custom-fields',
        privileges: ['custom_fields_advanced'],
        module: 'splitter'
    },
    {
        name: t('SETTINGS.workflows'),
        description: t('SETTINGS.workflows_description'),
        icon: <Workflow/>,
        href: '/settings/splitter/workflows',
        privileges: ['workflows_list_splitter'],
        module: 'splitter'
    },
    {
        name: t('SETTINGS.outputs'),
        description: t('SETTINGS.outputs_description'),
        icon: <FolderOutput/>,
        href: '/settings/splitter/outputs',
        privileges: ['outputs_list_splitter'],
        module: 'splitter'
    },
    {
        name: t('SETTINGS.ai_doctypes'),
        description: t('SETTINGS.ai_doctypes_description'),
        icon: <BrainCog/>,
        href: '/settings/splitter/ai-doctypes',
        privileges: ['list_ai_model_splitter'],
        module: 'splitter'
    },
    {
        name: t('SETTINGS.update-status'),
        description: t('SETTINGS.update-status_description_splitter'),
        icon: <Flag/>,
        href: '/settings/splitter/update-status',
        privileges: ['update_status_splitter'],
        module: 'splitter'
    },
    {
        name: t('SETTINGS.certified_copy'),
        description: t('SETTINGS.certified_copy_description'),
        icon: <ShieldCheck/>,
        href: '/settings/splitter/certified-copy',
        privileges: ['certified_copy'],
        module: 'splitter'
    },
    {
        name: t('FORMS.qr_code'),
        description: t('SETTINGS.qr_code_description'),
        icon: <QrCode/>,
        href: '/settings/splitter/separator',
        privileges: ['separator_splitter'],
        module: 'splitter'
    }
];

export function SettingsSplitterIndex() {
    const { user, loadingUser } = useUser();
    const options = getSettingsSplitterOptions();

    if (loadingUser) {
        return <Loader />;
    }

    return (
        <div className='grid grid-cols-3 gap-4 p-6'>
            { options.filter((option) => hasRequiredPermissions(user, option.privileges)).map((option) => (
                <SettingsCard key={ option['name'] } icon={ option['icon'] } title={ option['name'] }
                              description={ option['description'] } to={ option['href'] }/>
            )) }
        </div>
    );
}