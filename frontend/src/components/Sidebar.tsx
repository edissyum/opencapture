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

import axios from "axios";
import { t } from "i18next";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Activity,
    Briefcase,
    Building2,
    ChartNoAxesColumn,
    ChevronDown,
    ChevronsLeft,
    ChevronsRight,
    ChevronUp,
    Clock4,
    House,
    Info,
    LogOut,
    Settings,
    UserCog
} from "lucide-react";

import { LoginImage } from "./LoginImage";
import { hasRequiredPermissions } from "./auth/auth";

import { BACKEND_URL } from "../services/config";
import { useUser } from "../services/hooks/useUser";
import { useCustom } from "../services/custom/customContext";
import { clearPersistentState, usePersistentState } from "../services/hooks/usePersistentState";

export const handleLogout = async (navigate: any, user: any = {}, custom: any = '') => {
    const token = sessionStorage.getItem("accessToken");

    sessionStorage.clear();

    const prefix = 'OpenCapture_';
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith(prefix)) {
            clearPersistentState(key);
        }
    });

    if (user && Object.keys(user).length > 0 && token) {
        await axios.post(`${ BACKEND_URL }/${ custom }/ws/auth/logout`, { user_id: user.id }, {
            headers: {
                "Authorization": `Bearer ${ token }`,
                "Content-Type": "application/json",
            }
        });
    }

    navigate("/login", { replace: true });
};

export default function Sidebar() {
    const custom = useCustom();
    const { user, loadingUser } = useUser();
    const location = useLocation();
    const navigate = useNavigate();

    const userPanelRef = useRef<HTMLDivElement | null>(null);

    const [userPanelOpen, setUserPanelOpen] = useState(false);

    const [collapsed, setCollapsed] = useState(false);
    const [manuallyCollapsed, setManuallyCollapsed] = usePersistentState<boolean>('manuallyCollapsedSidebar', false);

    // If in verifier or splitter viewer, collapse the sidebar by default
    useEffect(() => {
        if (manuallyCollapsed) return;

        if (/(verifier|splitter)\/viewer\//.test(window.location.pathname)) {
            setCollapsed(true);
        } else {
            setCollapsed(false);
        }
    }, [location.pathname]);

    const standardClasses = "whitespace-nowrap flex items-center rounded-lg p-3 gap-2 hover:text-(--color-primary) text-(--text-secondary) font-semibold transition-colors border border-transparent";
    const activeClasses = "bg-(--bg-selected) text-(--color-primary)! hover:text-(--color-primary)! border-(--border-primary)!";

    const handleCollapse = () => {
        setCollapsed(!collapsed);
        setManuallyCollapsed(!collapsed);
    }

    // Merge collapsed state with manuallyCollapsed to determine final collapsed state
    useEffect(() => {
        if (manuallyCollapsed) {
            setCollapsed(true);
        } else {
            if (!/(verifier|splitter)\/viewer\//.test(window.location.pathname)) {
                setCollapsed(false);
            }
        }
    }, [manuallyCollapsed]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userPanelRef.current && !userPanelRef.current.contains(event.target as Node)) {
                setUserPanelOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setUserPanelOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    useEffect(() => {
        setUserPanelOpen(false);
    }, [location.pathname]);

    if (!user || loadingUser) return;
    return (
        <aside
            className={ `min-h-screen px-3 py-2 flex flex-col border-r border-r-(--border-secondary) shrink-0 transition-all ${ collapsed ? "w-18" : "w-65" }` }>
            <div className={ `flex w-full gap-2 items-center min-h-18 max-h-30 ${ collapsed ? "p-3" : "p-4" }` }>
                { !collapsed && (
                    <LoginImage className="mx-auto h-full w-11/12 object-contain"></LoginImage>
                ) }
                <span onClick={ handleCollapse } className="ml-auto font-xl cursor-pointer">
                    { collapsed ? <ChevronsRight/> : <ChevronsLeft/> }
                </span>
            </div>

            <nav className={ `${ collapsed ? 'items-center' : '' } flex flex-col gap-1.5` }>
                <Link to="/home" className={ `${ standardClasses } ${
                    ['/home', '/upload'].some((path) => location.pathname.includes(path)) ? activeClasses : ""
                }` }>
                    <House className='shrink-0' size={ 20 } { ...(collapsed && {
                        "data-tooltip-id": "tooltip",
                        "data-tooltip-content": t('GLOBAL.home')
                    }) }/>
                    { !collapsed && <span>{ t('GLOBAL.home') }</span> }
                </Link>

                { hasRequiredPermissions(user, ['settings']) && (
                    <Link to="/settings"
                          className={ `${ standardClasses } ${ location.pathname.includes("/settings") ? activeClasses : "" }` }>
                        <Settings className='shrink-0' size={ 20 } { ...(collapsed && {
                            "data-tooltip-id": "tooltip",
                            "data-tooltip-content": t('GLOBAL.settings')
                        }) }/>
                        { !collapsed && <span>{ t('GLOBAL.settings') }</span> }
                    </Link>
                ) }

                { hasRequiredPermissions(user, ['history']) && (
                    <Link to="/history"
                          className={ `${ standardClasses } ${ location.pathname.includes("/history") ? activeClasses : "" }` }>
                        <Clock4 className='shrink-0' size={ 20 } { ...(collapsed && {
                            "data-tooltip-id": "tooltip",
                            "data-tooltip-content": t('GLOBAL.history')
                        }) }/>
                        { !collapsed && <span>{ t('GLOBAL.history') }</span> }
                    </Link>
                ) }

                { hasRequiredPermissions(user, ['statistics']) && (
                    <Link to="/statistics"
                          className={ `${ standardClasses } ${ location.pathname.includes("/statistics") ? activeClasses : "" }` }>
                        <ChartNoAxesColumn className='shrink-0' size={ 20 } { ...(collapsed && {
                            "data-tooltip-id": "tooltip",
                            "data-tooltip-content": t('GLOBAL.statistics')
                        }) }/>
                        { !collapsed && <span>{ t('GLOBAL.statistics') }</span> }
                    </Link>
                ) }

                { hasRequiredPermissions(user, ['monitoring']) && (
                    <Link to="/monitoring"
                          className={ `${ standardClasses } ${ location.pathname.includes("/monitoring") ? activeClasses : "" }` }>
                        <Activity className='shrink-0' size={ 20 } { ...(collapsed && {
                            "data-tooltip-id": "tooltip",
                            "data-tooltip-content": t('GLOBAL.monitoring')
                        }) }/>
                        { !collapsed && <span>{ t('GLOBAL.monitoring') }</span> }
                    </Link>
                ) }

                { hasRequiredPermissions(user, ['suppliers_list']) && (
                    <Link to="/suppliers"
                          className={ `${ standardClasses } ${ location.pathname.includes("/suppliers") ? activeClasses : "" }` }>
                        <Building2 className='shrink-0' size={ 20 } { ...(collapsed && {
                            "data-tooltip-id": "tooltip",
                            "data-tooltip-content": t('ACCOUNTS.suppliers_list')
                        }) }/>
                        { !collapsed && <span>{ t('ACCOUNTS.suppliers_list') }</span> }
                    </Link>
                ) }

                { hasRequiredPermissions(user, ['customers_list']) && (
                    <Link to="/customers"
                          className={ `${ standardClasses } ${ location.pathname.includes("/customers") ? activeClasses : "" }` }>
                        <Briefcase className='shrink-0' size={ 20 } { ...(collapsed && {
                            "data-tooltip-id": "tooltip",
                            "data-tooltip-content": t('ACCOUNTS.customers_list')
                        }) }/>
                        { !collapsed && <span>{ t('ACCOUNTS.customers_list') }</span> }
                    </Link>
                ) }

                <Link to="/about"
                      className={ `${ standardClasses } ${ location.pathname.includes("/about") ? activeClasses : "" }` }>
                    <Info className='shrink-0' size={ 20 } { ...(collapsed && {
                        "data-tooltip-id": "tooltip",
                        "data-tooltip-content": t('SETTINGS.abouts_us')
                    }) }/>
                    { !collapsed && <span>{ t('SETTINGS.abouts_us') }</span> }
                </Link>
            </nav>

            <div ref={ userPanelRef }
                 className="relative mt-auto text-(--text-secondary) flex flex-col gap-3 bg-(--bg-secondary) rounded-lg">
                { userPanelOpen && (
                    <div
                        className='absolute bottom-full mb-2 z-30 rounded-lg border border-(--border-secondary) bg-(--bg-primary) shadow-lg'>
                        <div
                            className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 text-(--text-secondary)
                                       hover:bg-(--bg-secondary) hover:text-(--text-primary) transition-colors min-w-58"
                            onClick={ () => {
                                setUserPanelOpen(false);
                                navigate('/profile');
                            } }>
                            <UserCog size={ 18 } className='shrink-0'/>
                            <span className='truncate'>{ t('GLOBAL.my_profile') }</span>
                        </div>

                        <div
                            className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 text-(--text-error)
                                       hover:bg-(--bg-secondary) transition-colors border-t border-(--border-secondary)"
                            onClick={ async () => {
                                setUserPanelOpen(false);
                                await handleLogout(navigate, user, custom);
                            } }>
                            <LogOut size={ 18 } className='shrink-0'/>
                            <span className='truncate'>{ t('GLOBAL.logout') }</span>
                        </div>
                    </div>
                ) }

                <button
                    type="button"
                    className={ `w-full cursor-pointer whitespace-nowrap flex items-center rounded-lg p-2 gap-3 hover:text-(--text-primary)
                                border border-transparent ${ userPanelOpen ? 'bg-(--bg-secondary)! border-(--border-secondary)!' : 'bg-(--bg-primary)!' }
                                text-(--text-secondary) font-semibold transition-colors ${ collapsed ? '' : 'px-3' }` }
                    onClick={ () => setUserPanelOpen((prev) => !prev) }>
                    <img src='/imgs/user.svg' alt='user profile'
                         className='shrink-0 size-8' { ...(collapsed && {
                             "data-tooltip-id": "tooltip",
                             "data-tooltip-content": `${ user.firstname } ${ user.lastname }`
                         }) }/>

                    { !collapsed &&
                        <>
                            <div className='flex flex-col text-left max-w-8/12'>
                                <span className='truncate' title={ `${ user.firstname } ${ user.lastname }` }>
                                    { user.firstname } { user.lastname }
                                </span>
                                <span className='text-sm font-normal truncate'>
                                    { user.username }
                                </span>
                            </div>

                            { userPanelOpen ? (
                                <ChevronUp size={ 22 } className='shrink-0 ml-auto'/>
                            ) : (
                                <ChevronDown size={ 22 } className='shrink-0 ml-auto'/>
                            ) }
                        </>
                    }
                </button>
            </div>
        </aside>
    );
}
