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
import { Search, Shield, SlidersHorizontal, SquareCheckBig, UsersRound } from "lucide-react";

export const getPrivilegesParent: any = () => [
    { 'id': 'general', 'name': t('ROLES.global_privileges'), icon: <SlidersHorizontal size={ 18 }/> },
    { 'id': 'administration', 'name': t('ROLES.admin_privileges'), icon: <Shield size={ 18 }/> },
    { 'id': 'verifier', 'name': t('ROLES.verifier_privileges'), icon: <SquareCheckBig size={ 18 }/> },
    { 'id': 'splitter', 'name': t('ROLES.splitter_privileges'), icon: <Search size={ 18 }/> },
    { 'id': 'accounts', 'name': t('ROLES.accounts_privileges'), icon: <UsersRound size={ 18 }/> },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ = [
    t('PRIVILEGES.access_verifier'),
    t('PRIVILEGES.access_splitter'),
    t('PRIVILEGES.settings'),
    t('PRIVILEGES.upload'),
    t('PRIVILEGES.users_list'),
    t('PRIVILEGES.add_user'),
    t('PRIVILEGES.update_user'),
    t('PRIVILEGES.roles_list'),
    t('PRIVILEGES.add_role'),
    t('PRIVILEGES.update_role'),
    t('PRIVILEGES.version_update'),
    t('PRIVILEGES.custom_fields'),
    t('PRIVILEGES.custom_fields_advanced'),
    t('PRIVILEGES.forms_list'),
    t('PRIVILEGES.customers_list'),
    t('PRIVILEGES.suppliers_list'),
    t('PRIVILEGES.create_supplier'),
    t('PRIVILEGES.update_supplier'),
    t('PRIVILEGES.change_language'),
    t('PRIVILEGES.form_builder'),
    t('PRIVILEGES.export_suppliers'),
    t('PRIVILEGES.import_suppliers'),
    t('PRIVILEGES.history'),
    t('PRIVILEGES.add_output'),
    t('PRIVILEGES.add_form'),
    t('PRIVILEGES.update_output'),
    t('PRIVILEGES.position_mask_list'),
    t('PRIVILEGES.update_form'),
    t('PRIVILEGES.outputs_list'),
    t('PRIVILEGES.add_position_mask'),
    t('PRIVILEGES.update_position_mask'),
    t('PRIVILEGES.create_customer'),
    t('PRIVILEGES.update_customer'),
    t('PRIVILEGES.document_type_splitter'),
    t('PRIVILEGES.separator_splitter'),
    t('PRIVILEGES.update_output_splitter'),
    t('PRIVILEGES.add_output_splitter'),
    t('PRIVILEGES.outputs_list_splitter'),
    t('PRIVILEGES.update_form_splitter'),
    t('PRIVILEGES.add_form_splitter'),
    t('PRIVILEGES.forms_list_splitter'),
    t('PRIVILEGES.statistics'),
    t('PRIVILEGES.configurations'),
    t('PRIVILEGES.docservers'),
    t('PRIVILEGES.regex'),
    t('PRIVILEGES.update_document_type'),
    t('PRIVILEGES.add_document_type'),
    t('PRIVILEGES.login_methods'),
    t('PRIVILEGES.verifier_settings'),
    t('PRIVILEGES.splitter_settings'),
    t('PRIVILEGES.mailcollect'),
    t('PRIVILEGES.user_quota'),
    t('PRIVILEGES.list_ai_model'),
    t('PRIVILEGES.list_ai_model_splitter'),
    t('PRIVILEGES.create_ai_model'),
    t('PRIVILEGES.create_ai_model_splitter'),
    t('PRIVILEGES.update_ai_model'),
    t('PRIVILEGES.update_ai_model_splitter'),
    t('PRIVILEGES.update_status'),
    t('PRIVILEGES.update_status_splitter'),
    t('PRIVILEGES.access_config'),
    t('PRIVILEGES.monitoring'),
    t('PRIVILEGES.verifier_display'),
    t('PRIVILEGES.workflows_list'),
    t('PRIVILEGES.add_workflow'),
    t('PRIVILEGES.update_workflow'),
    t('PRIVILEGES.workflows_list_splitter'),
    t('PRIVILEGES.add_workflow_splitter'),
    t('PRIVILEGES.update_workflow_splitter'),
    t('PRIVILEGES.generate_auth_token'),
    t('PRIVILEGES.update_login_top_message'),
    t('PRIVILEGES.attachments_list_splitter'),
    t('PRIVILEGES.attachments_list_verifier'),
    t('PRIVILEGES.upload_attachments_verifier'),
    t('PRIVILEGES.upload_attachments_splitter'),
    t('PRIVILEGES.add_llm_models'),
    t('PRIVILEGES.update_llm_models'),
    t('PRIVILEGES.list_llm_models'),
    t('PRIVILEGES.certified_copy')
];