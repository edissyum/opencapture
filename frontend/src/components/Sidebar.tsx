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
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Activity,
    Briefcase,
    Building2,
    ChartNoAxesColumn,
    ChevronsLeft,
    ChevronsRight,
    Clock4,
    House,
    Info,
    LogOut,
    Settings
} from "lucide-react";

import { LoginImage } from "./LoginImage";

export default function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.clear();

        navigate("/login", { replace: true });
    };

    const [collapsed, setCollapsed] = useState(false);

    const standardClasses = "flex items-center p-3 gap-2 hover:text-(--color-primary)! text-(--text-secondary)! font-semibold";
    const activeClasses = "bg-green-400/10 rounded-lg text-(--color-primary)!";

    return (
        <aside
            className={ `min-h-screen px-3 py-2 flex flex-col border-r-2 border-r-(--border-secondary) transition-all duration-300 ${ collapsed ? "w-18" : "w-70" }` }>
            <div
                className={ `flex items-center max-w-10/12 min-h-18 max-h-30 gap-3 mb-3 ${ collapsed ? "p-2" : "p-4" }` }>
                { !collapsed && (
                    <LoginImage className="mx-auto"></LoginImage>
                ) }
                <span onClick={ () => setCollapsed(!collapsed) }
                      className="mb-2 font-xl cursor-pointer">
                    { collapsed ? <ChevronsRight/> : <ChevronsLeft/> }
                </span>
            </div>

            <nav className={ `${ collapsed ? 'items-center' : '' } flex flex-col gap-3` }>
                <Link to="/home" className={ `border-2 ${ standardClasses } ${
                    ['/home', '/upload'].some((path) => location.pathname.includes(path)) ? activeClasses + " border-(--border-primary)" : "border-transparent"
                }` }>
                    <House size={ 20 } { ...(collapsed && {
                        "data-tooltip-id": "tooltip",
                        "data-tooltip-content": t('GLOBAL.home'),
                    }) }/>
                    { !collapsed && <span>{ t('GLOBAL.home') }</span> }
                </Link>

                <Link to="/settings"
                      className={ `border-2 ${ standardClasses } ${ location.pathname.includes("/settings") ? activeClasses + " border-(--border-primary)" : "border-transparent" }` }>
                    <Settings size={ 20 } { ...(collapsed && {
                        "data-tooltip-id": "tooltip",
                        "data-tooltip-content": t('GLOBAL.settings'),
                    }) }/>
                    { !collapsed && <span>{ t('GLOBAL.settings') }</span> }
                </Link>

                <Link to="/history"
                      className={ `border-2 ${ standardClasses } ${ location.pathname.includes("/history") ? activeClasses + " border-(--border-primary)" : "border-transparent" }` }>
                    <Clock4 size={ 20 } { ...(collapsed && {
                        "data-tooltip-id": "tooltip",
                        "data-tooltip-content": t('GLOBAL.history'),
                    }) }/>
                    { !collapsed && <span>{ t('GLOBAL.history') }</span> }
                </Link>

                <Link to="/statistics"
                      className={ `border-2 ${ standardClasses } ${ location.pathname.includes("/statistics") ? activeClasses + " border-(--border-primary)" : "border-transparent" }` }>
                    <ChartNoAxesColumn size={ 20 } { ...(collapsed && {
                        "data-tooltip-id": "tooltip",
                        "data-tooltip-content": t('GLOBAL.statistics'),
                    }) }/>
                    { !collapsed && <span>{ t('GLOBAL.statistics') }</span> }
                </Link>

                <Link to="/monitoring"
                      className={ `border-2 ${ standardClasses } ${ location.pathname.includes("/monitoring") ? activeClasses + " border-(--border-primary)" : "border-transparent" }` }>
                    <Activity size={ 20 } { ...(collapsed && {
                        "data-tooltip-id": "tooltip",
                        "data-tooltip-content": t('GLOBAL.monitoring'),
                    }) }/>
                    { !collapsed && <span>{ t('GLOBAL.monitoring') }</span> }
                </Link>

                <Link to="/suppliers"
                      className={ `border-2 ${ standardClasses } ${ location.pathname.includes("/suppliers") ? activeClasses + " border-(--border-primary)" : "border-transparent" }` }>
                    <Building2 size={ 20 } { ...(collapsed && {
                        "data-tooltip-id": "tooltip",
                        "data-tooltip-content": t('ACCOUNTS.suppliers_list'),
                    }) }/>
                    { !collapsed && <span>{ t('ACCOUNTS.suppliers_list') }</span> }
                </Link>

                <Link to="/customers"
                      className={ `border-2 ${ standardClasses } ${ location.pathname.includes("/customers") ? activeClasses + " border-(--border-primary)" : "border-transparent" }` }>
                    <Briefcase size={ 20 } { ...(collapsed && {
                        "data-tooltip-id": "tooltip",
                        "data-tooltip-content": t('ACCOUNTS.customers_list'),
                    }) }/>
                    { !collapsed && <span>{ t('ACCOUNTS.customers_list') }</span> }
                </Link>

                <Link to="/about"
                      className={ `border-2 ${ standardClasses } ${ location.pathname.includes("/about") ? activeClasses + " border-(--border-primary)" : "border-transparent" }` }>
                    <Info size={ 20 } { ...(collapsed && {
                        "data-tooltip-id": "tooltip",
                        "data-tooltip-content": t('SETTINGS.abouts_us'),
                    }) }/>
                    { !collapsed && <span>{ t('SETTINGS.abouts_us') }</span> }
                </Link>
            </nav>

            <div className="mt-auto text-(--text-secondary) flex flex-col gap-3">
                <a className={ `${ standardClasses }` } onClick={ handleLogout }>
                    <LogOut size={ 20 } { ...(collapsed && {
                        "data-tooltip-id": "tooltip",
                        "data-tooltip-content": t('GLOBAL.log_out'),
                    }) }/>
                    { !collapsed && <span>{ t('GLOBAL.log_out') }</span> }
                </a>
            </div>
        </aside>
    );
}
