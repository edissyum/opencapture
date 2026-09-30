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
import { AtSign, Brush, HardDrive, HashIcon, Inbox, Lock, UserKey, Users, Wrench } from "lucide-react";

import { useUser } from "../../../services/hooks/useUser";

import { Loader } from "../../../components/loader/Loader";
import { hasRequiredPermissions } from "../../../components/auth/auth";
import { SettingsCard } from "../../../components/settings/SettingsCard";

export const getSettingsGeneralOptions = () => [
    {
        name: t('SETTINGS.customization'),
        description: t('SETTINGS.customization_description'),
        icon: <Brush/>,
        privileges: ['customization'],
        href: '/settings/general/customization'
    },
    {
        name: t('SETTINGS.security'),
        description: t('SETTINGS.security_description'),
        icon: <Lock/>,
        privileges: ['security'],
        href: '/settings/general/security'
    },
    {
        name: t('SETTINGS.smtp'),
        description: t('SETTINGS.smtp_description'),
        icon: <AtSign/>,
        privileges: ['smtp'],
        href: '/settings/general/smtp'
    },
    {
        name: t('SETTINGS.docservers'),
        description: t('SETTINGS.docservers_description'),
        icon: <HardDrive/>,
        privileges: ['docservers'],
        href: '/settings/general/docservers'
    },
    {
        name: t('SETTINGS.regex'),
        description: t('SETTINGS.regex_description'),
        icon: <HashIcon/>,
        privileges: ['regex'],
        href: '/settings/general/regex'
    },
    {
        name: t('SETTINGS.mailcollect'),
        description: t('SETTINGS.mailcollect_description'),
        icon: <Inbox/>,
        privileges: ['mailcollect'],
        href: '/settings/general/mailcollect'
    },
    {
        name: t('SETTINGS.users'),
        description: t('SETTINGS.users_description'),
        icon: <Users/>,
        privileges: ['users_list'],
        href: '/settings/general/users'
    },
    {
        name: t('SETTINGS.roles'),
        description: t('SETTINGS.roles_description'),
        icon: <UserKey/>,
        privileges: ['roles_list'],
        href: '/settings/general/roles'
    },
    {
        name: t('SETTINGS.advanced'),
        description: t('SETTINGS.advanced_description'),
        icon: <Wrench/>,
        privileges: ['advanced'],
        href: '/settings/general/advanced'
    }
];

export function SettingsGeneralIndex() {
    const { user, loadingUser } = useUser();
    const options = getSettingsGeneralOptions();

    if (loadingUser) {
        return <Loader/>;
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