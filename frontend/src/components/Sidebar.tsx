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
    Activity, Briefcase, Building2, ChartNoAxesColumn, ChevronsLeft, ChevronsRight, Clock4, House, Info,
    LogOut, Settings
} from "lucide-react";

export default function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");

        navigate("/login", { replace: true });
    };

    const [collapsed, setCollapsed] = useState(false);

    const standardClasses = "flex items-center p-2 gap-2 hover:text-green-400! text-gray-400! font-semibold";
    const activeClasses = "bg-green-400/10 border-2 border-green-400 rounded-lg text-green-400!";

    return (
        <aside className={`min-h-screen p-4 flex flex-col transition-all duration-300 ${collapsed ? "w-18" : "w-72"}`}>
            <div className={`flex items-center gap-4 mb-4 ${collapsed ? "p-2" : "p-4"}`}>
                { !collapsed && (<span><img src={"/src/assets/imgs/login_image.png"} alt="Sidebar image"/></span>) }
                <span onClick={ () => setCollapsed(!collapsed) }
                      className="mb-2 font-xl cursor-pointer">
                    { collapsed ? <ChevronsRight/> : <ChevronsLeft/> }
                </span>
            </div>

            <nav className="flex flex-col gap-3">
                <Link to="/home" className={`${standardClasses} ${location.pathname.includes("/home") ? activeClasses : ""}`}>
                    <House size={20} />
                    {!collapsed && <span>{ t('GLOBAL.home') }</span>}
                </Link>

                <Link to="/settings" className={`${standardClasses} ${location.pathname.includes("/settings") ? activeClasses : ""}`}>
                    <Settings size={20} />
                    {!collapsed && <span>{ t('GLOBAL.settings') }</span>}
                </Link>

                <Link to="/history" className={`${standardClasses} ${location.pathname.includes("/history") ? activeClasses : ""}`}>
                    <Clock4 size={20} />
                    {!collapsed && <span>{ t('GLOBAL.history') }</span>}
                </Link>

                <Link to="/statistics" className={`${standardClasses} ${location.pathname.includes("/statistics") ? activeClasses : ""}`}>
                    <ChartNoAxesColumn size={20} />
                    {!collapsed && <span>{ t('GLOBAL.statistics') }</span>}
                </Link>

                <Link to="/monitoring" className={`${standardClasses} ${location.pathname.includes("/monitoring") ? activeClasses : ""}`}>
                    <Activity size={20} />
                    {!collapsed && <span>{ t('GLOBAL.monitoring') }</span>}
                </Link>

                <Link to="/suppliers" className={`${standardClasses} ${location.pathname.includes("/suppliers") ? activeClasses : ""}`}>
                    <Building2 size={20} />
                    {!collapsed && <span>{ t('ACCOUNTS.suppliers_list') }</span>}
                </Link>

                <Link to="/customers" className={`${standardClasses} ${location.pathname.includes("/customers") ? activeClasses : ""}`}>
                    <Briefcase size={20} />
                    {!collapsed && <span>{ t('ACCOUNTS.customers_list') }</span>}
                </Link>

                <Link to="/about" className={`${standardClasses} ${location.pathname.includes("/about") ? activeClasses : ""}`}>
                    <Info size={20} />
                    {!collapsed && <span>{ t('SETTINGS.abouts_us') }</span>}
                </Link>
            </nav>

            <div className="mt-auto text-gray-400 flex flex-col gap-3">
                <a className={`${standardClasses}`} onClick={handleLogout}>
                    <LogOut size={20} />
                    {!collapsed && <span>{ t('GLOBAL.log_out') }</span>}
                </a>
            </div>
        </aside>
    );
}
