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
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    ArrowRightToLine,
    CirclePause,
    Download,
    FileText,
    Plus,
    Sheet,
    Trash2,
    Upload,
    UserRoundPlus
} from "lucide-react";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";

import { AxiosApiCall } from "../../../../services/hooks/AxiosApiCall";
import { showConfirmDialog } from "../../../../services/hooks/ConfirmDialog";

import Input from "../../../../components/Input";
import { Button } from "../../../../components/Button";
import { Table } from "../../../../components/list/Table";
import { showToast } from "../../../../components/ToastProvider";
import { ImportSpreadSheet } from "../../../../components/settings/ImportSpreadSheet";
import { SortableFieldItem } from "../../../../components/settings/doctypes/doctypesTree";

export function SettingsGeneralUsers() {
    const { get, put, post, del } = AxiosApiCall();

    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 16,
        page: 0,
        sortField: null as string | null,
        sortOrder: null as 1 | -1 | null
    });

    const [loadingExport, setLoadingExport] = useState(false);
    const [loadingImport, setLoadingImport] = useState(false);
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);

    const availableFields = [
        { label: t('USERS.username'), id: 'username', selected: true },
        { label: t('ACCOUNTS.lastname'), id: 'lastname', selected: true },
        { label: t('ACCOUNTS.firstname'), id: 'firstname', selected: true },
        { label: t('ACCOUNTS.email'), id: 'email', selected: true },
        { label: t('USERS.role'), id: 'role', selected: true }
    ];

    const [unselectedFields, setUnselectedFields] = useState<any[]>(
        availableFields.filter(f => !f.selected)
    );

    const [selectedFields, setSelectedFields] = useState<any[]>(
        availableFields.filter(f => f.selected)
    );

    const sensors = useSensors(useSensor(PointerSensor));
    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = selectedFields.findIndex(f => f.id === active.id);
        const newIndex = selectedFields.findIndex(f => f.id === over.id);

        setSelectedFields(arrayMove(selectedFields, oldIndex, newIndex));
    };
    const delimiterOptions = [
        { label: t("DOCTYPES.tab"), value: "TAB", icon: <ArrowRightToLine size={ 16 }/> },
        { label: t("DOCTYPES.comma"), value: "COMMA", icon: <span style={ { transform: "translateY(2px)" } }>,</span> },
        {
            label: t("DOCTYPES.semicolon"),
            value: "SEMICOLON",
            icon: <span style={ { transform: "translateY(2px)" } }>;</span>
        }
    ];

    const [format] = useState("CSV");
    const [delimiter, setDelimiter] = useState(delimiterOptions[2].value);

    const columns = [
        { id: 'id', field: 'id', header: '', sortable: true, className: 'w-16' },
        {
            id: 'username',
            field: 'username',
            sortable: true,
            header: t('USERS.username'),
            className: 'max-w-[20rem] w-[20rem]'
        },
        { id: 'lastname', field: 'lastname', header: t('USERS.lastname'), sortable: true },
        { id: 'firstname', field: 'firstname', header: t('USERS.firstname'), sortable: true },
        { id: 'role', field: 'label', header: t('USERS.role') },
        {
            id: 'status',
            header: t('GLOBAL.status'),
            body: (row: any) => (
                <span
                    className={ `px-2 py-1 rounded-lg text-xs font-normal 
                        ${ row.enabled ? 'bg-(--bg-success) text-(--text-success)' : 'bg-(--bg-error) text-(--text-error)' }` }>
                    { row.enabled ? t('USERS.active') : t('USERS.inactive') }
                </span>
            ),
            className: 'max-w-[8rem] w-[8rem]'
        },
    ];

    const actions: any = [
        {
            label: t('USERS.enable_users'),
            icon: <CirclePause size={ 16 }/>,
            command: () => handleEnable()
        },
        {
            label: t('USERS.disable_users'),
            icon: <CirclePause size={ 16 }/>,
            command: () => handleDisable()
        },
        {
            label: <span className='critical'>{ t('GLOBAL.delete') }</span>,
            icon: <Trash2 size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    const getActionsLine = (row: any) => [
        {
            label: t('USERS.enable_users'),
            visible: !row?.enabled,
            icon: <CirclePause size={ 16 }/>,
            command: () => handleEnable()
        },
        {
            label: t('USERS.disable_users'),
            icon: <CirclePause size={ 16 }/>,
            visible: row?.enabled,
            command: () => handleDisable()
        },
        {
            label: <span className='critical'>{ t('USERS.delete_users') }</span>,
            icon: <Trash2 size={ 16 }/>,
            command: () => handleDelete()
        }
    ];

    // Fetch users
    useEffect(() => {
        if (loadingUsers) return;
        setLoadingUsers(true);

        const fetchUsers = async () => {
            try {
                const response = await get('/users/list', {
                    params: {
                        offset: lazyParams.first,
                        limit: lazyParams.rows,
                        filter: lazyParams.sortField,
                        order: lazyParams.sortOrder === 1 ? 'asc' : lazyParams.sortOrder === -1 ? 'desc' : null,
                        search: searchTerm,
                    }
                });
                setTotalUsers(response.users[0]?.total || 0);
                setUsers(response.users);
            } catch (error) {
                console.error('Error while fetching users :', error);
            } finally {
                setLoadingUsers(false);
            }
        }
        fetchUsers().then();
    }, [lazyParams, searchTerm]);

    const refresh = () => {
        setTimeout(() => {
            setSelectedUsers([]);
            setTotalUsers(0);
            setLazyParams({ ...lazyParams, first: 0 });
        });
    }

    const handleDisable = () => {
        if (selectedUsers.length === 0) return;

        showConfirmDialog({
            title: t('USERS.disable_user', { count: selectedUsers.length }),
            message: t('USERS.confirm_disable_user', { count: selectedUsers.length }),
            confirmText: t('GLOBAL.disable'),
            cancelText: t('GLOBAL.cancel'),
            danger: true,
            onConfirm: async () => {
                await disableUsers(selectedUsers.map((user: any) => user.id));
                refresh();
            },
            onCancel: () => {
                setSelectedUsers([]);
            }
        })
    }
    const disableUsers = async (ids: string[]) => {
        ids.forEach((id) => {
            try {
                put(`/users/disable/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('USERS.user_disabled', { count: selectedUsers.length }), 'success');
                }
            } catch (err) {
                console.error("Erreur désactivation de l'utilisateur :", err);
            }
        });
    }

    const handleEnable = () => {
        if (selectedUsers.length === 0) return;

        showConfirmDialog({
            title: t('USERS.enable_user', { count: selectedUsers.length }),
            message: t('USERS.confirm_enable_user', { count: selectedUsers.length }),
            confirmText: t('GLOBAL.enable'),
            cancelText: t('GLOBAL.cancel'),
            onConfirm: async () => {
                await enableUsers(selectedUsers.map((user: any) => user.id));
                refresh();
            },
            onCancel: () => {
                setSelectedUsers([]);
            }
        })
    }
    const enableUsers = async (ids: string[]) => {
        ids.forEach((id) => {
            try {
                put(`/users/enable/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('USERS.user_enabled', { count: selectedUsers.length }), 'success');
                }
            } catch (err) {
                console.error("Erreur activation de l'utilisateur :", err);
            }
        });
    }

    const handleDelete = () => {
        if (selectedUsers.length === 0) return;

        showConfirmDialog({
            title: t('USERS.delete_user', { count: selectedUsers.length }),
            message: t('USERS.confirm_delete_user', { count: selectedUsers.length }),
            confirmText: t('GLOBAL.delete'),
            cancelText: t('GLOBAL.cancel'),
            danger: true,
            onConfirm: async () => {
                await deleteUsers(selectedUsers.map((user: any) => user.id));
                refresh();
            },
            onCancel: () => {
                setSelectedUsers([]);
            }
        });
    }
    const deleteUsers = async (ids: string[]) => {
        for (const id of ids) {
            try {
                await del(`/users/delete/${ id }`);
                if (id === ids[ids.length - 1]) {
                    showToast(t('USERS.user_deleted', { count: selectedUsers.length }), 'success');
                }
            } catch (err) {
                console.error("Error deleting user :", err);
            }
        }
    }

    const handleRemoveField = (field: any) => {
        setSelectedFields(prev => prev.filter(f => f.id !== field.id));
        setUnselectedFields(prev => [...prev, { ...field, selected: false }]);
    }

    const exportUsers = async () => {
        setLoadingExport(true);

        try {
            const payload = {
                extension: format,
                delimiter: delimiter,
                columns: selectedFields
            };

            const response = await post(`/users/export`, payload);
            if (!response.encoded_file) {
                showToast(t('USERS.export_failed'), 'error');
                return;
            }

            const binary = atob(response.encoded_file);
            const bytes = new Uint8Array(binary.length);

            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }

            const blob = new Blob([bytes], { type: "text/csv;charset=utf-8" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `users.${ format.toLowerCase() }`;
            link.click();
            window.URL.revokeObjectURL(url);

            showToast(t('USERS.export_success'), 'success');
        } catch (error) {
            console.error("Error exporting users :", error);
        } finally {
            setLoadingExport(false);
        }
    }

    const importUsers = async (formData: any) => {
        if (!formData) return;

        setLoadingImport(true);

        await post('/users/csv/import', formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        setLoadingImport(false);
        setShowImportDialog(false);
        showToast(t('USERS.import_success'), 'success');
    }

    return (
        <div className="p-6 bg-(--bg-secondary) h-full w-full flex flex-col flex-1">
            { showExportDialog && (
                <>
                    <div className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm"
                         onClick={ () => setShowExportDialog(false) }/>
                    <div className="fixed z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-y-auto
                                                h-fit max-h-screen border border-(--border-secondary)
                                                rounded-lg bg-(--bg-primary) flex flex-col">
                        <div className='flex flex-col p-6 gap-4'>
                            <h2>
                                { t('USERS.export_users') }
                            </h2>
                            <div className='flex flex-col gap-1'>
                                <p className='text-(--text-secondary) font-semibold'>
                                    { t('DOCTYPES.format') }
                                </p>
                                <div className={ `border border-(--border-secondary) hover:border-(--border-primary) transition-colors
                                                  ${ format === "CSV" ? 'bg-(--bg-selected) border-(--border-primary)! text-(--color-primary)' : '' }
                                                  rounded-lg px-12 py-4 cursor-pointer flex flex-col items-center text-center justify-center gap-2` }>
                                    <Sheet/>
                                    <p className='text-md font-semibold min-w-32'>CSV</p>
                                </div>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <p className='text-(--text-secondary) font-semibold'>
                                    { t('DOCTYPES.delimiter') }
                                </p>
                                <div className='flex gap-4'>
                                    { delimiterOptions.map(opt => (
                                        <div key={ opt.value } onClick={ () => setDelimiter(opt.value) }
                                             className={ ` border border-(--border-secondary) hover:border-(--border-primary) transition-colors
                                                    ${ delimiter === opt.value ? 'bg-(--bg-selected) border-(--border-primary)! text-(--color-primary)' : '' }
                                                    rounded-lg px-12 py-4 cursor-pointer flex flex-col items-center text-center justify-center gap-2` }>
                                            { opt.icon }
                                            <p className='text-md font-semibold min-w-32'>{ opt.label }</p>
                                        </div>
                                    )) }
                                </div>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <p className='text-(--text-secondary) font-semibold'>
                                    { t('DOCTYPES.fields_to_export') }
                                </p>
                                <>
                                    <DndContext sensors={ sensors } collisionDetection={ closestCenter }
                                                onDragEnd={ handleDragEnd }>
                                        <SortableContext
                                            items={ selectedFields.map(f => f.id) }
                                            strategy={ verticalListSortingStrategy }
                                        >
                                            <div
                                                className='border border-(--border-secondary) rounded-lg flex flex-col gap-2'>
                                                { selectedFields.map(field => (
                                                    <SortableFieldItem key={ field.id } field={ field }
                                                                       lastField={ field.id === selectedFields[selectedFields.length - 1].id }
                                                                       onRemove={ () => handleRemoveField(field) }/>
                                                )) }
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                </>
                                <div className='flex gap-4 mt-2'>
                                    { unselectedFields.map(field => (
                                        <div key={ field.id } onClick={ () => {
                                            setUnselectedFields(prev => prev.filter(f => f.id !== field.id));
                                            setSelectedFields(prev => [...prev, { ...field, selected: true }]);
                                        } }
                                             className={ `border border-(--border-secondary) hover:border-(--border-primary) transition-colors
                                                    rounded-md px-2 py-1 cursor-pointer flex items-center text-center justify-center gap-2` }>
                                            { field.label }
                                            <Plus size={ 16 }/>
                                        </div>
                                    )) }
                                </div>
                            </div>
                            <div className='mt-4 flex justify-end w-full gap-4'>
                                <Button variant={ "no_bg" } onClick={ () => setShowExportDialog(false) }>
                                    { t('GLOBAL.cancel') }
                                </Button>
                                <Button onClick={ () => exportUsers() }>
                                    { loadingExport ? t('DOCTYPES.exporting') : t('USERS.export_users') }
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            ) }

            { showImportDialog && (
                <ImportSpreadSheet
                    loading={ loadingImport }
                    onValidate={ importUsers }
                    title={ t('USERS.import_users') }
                    onClose={ () => setShowImportDialog(false) }
                    columns={ ['username', 'lastname', 'firstname', 'mail', 'role'] }
                />
            ) }

            <div className='flex items-center gap-6 mb-4'>
                <span className='flex items-center gap-1'>
                    <FileText size={ 16 }/>
                    <span>
                        { t('USERS.users', { count: totalUsers }) } ({ totalUsers || 0 })
                    </span>
                </span>
                <Input id="search" type="text" name="search" className='bg-(--bg-primary)' height='h-10' autoFocus
                       value={ searchTerm } placeholder={ t('GLOBAL.search') }
                       onChange={ (e) => setSearchTerm(e.target.value) }/>
                <span className='flex gap-2 ml-auto text-(--text-secondary) cursor-pointer'>
                    <Button
                        size='sm'
                        variant="bg_white"
                        className='px-3 border'
                        onClick={ () => navigate('/settings/general/users/create') }
                    >
                        <UserRoundPlus size={ 16 }/> { t('USERS.add_user') }
                    </Button>
                    <div className="actionsButton ml-auto">
                        <span className="rounded-l-md bg-(--bg-primary) border"
                              onClick={ () => setShowImportDialog(true) }
                              data-tooltip-id='tooltip' data-tooltip-content={ t('USERS.import') }>
                            <Download size={ 16 }/>
                        </span>

                        <span className="rounded-r-md bg-(--bg-primary) border border-l-0"
                              onClick={ () => setShowExportDialog(true) }
                              data-tooltip-id='tooltip' data-tooltip-content={ t('USERS.export') }>
                            <Upload size={ 16 }/>
                        </span>
                    </div>
                </span>
            </div>
            <Table
                baseLink="/settings/general/users/edit/"
                data={ users }
                actions={ actions }
                pagination={ true }
                columns={ columns }
                loading={ loadingUsers }
                lazyParams={ lazyParams }
                checkboxSelection={ true }
                actionsLine={ getActionsLine }
                selectedRows={ selectedUsers }
                rowsPerPage={ lazyParams.rows }
                skeletonRows={ lazyParams.rows }
                totalRecords={ totalUsers || 0 }
                rowsPerPageOptions={ [
                    { "value": 4, "label": "4" },
                    { "value": 8, "label": "8" },
                    { "value": 16, "label": "16" },
                    { "value": 32, "label": "32" }
                ] }
                emptyMessage={ t("USERS.no_user") }
                paginatorLeftText={ t('USERS.selected', { count: selectedUsers.length }) }
                onLazyParamsChange={ setLazyParams }
                onSelectionChange={ (rows) => setSelectedUsers(rows) }
            />

            <p className='font-semibold text-(--text-primary) mt-4'>
                { t('USERS.user_quota') }
            </p>
            <div onClick={ () => navigate('/settings/general/users/quota') }
                 className='w-fit text-(--text-secondary) text-sm mb-6 flex items-center gap-0.5 cursor-pointer hover:text-(--color-primary)'>
                { t('SECURITY.here') }
                <ArrowRight size={ 18 }/>
            </div>
        </div>
    );
}