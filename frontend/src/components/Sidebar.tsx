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
import { Link } from "react-router-dom";
import { ChevronsLeft, ChevronsRight, House, Settings } from "lucide-react";

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    const standardClasses = "flex items-center p-2 gap-2";
    const activeClasses = "bg-green-400/10 border border-green-400 rounded-lg";

    return (
        <aside className={`min-h-screen p-4 flex flex-col transition-all duration-300 ${collapsed ? "w-18" : "w-72"}`}>
            <div className="flex items-center gap-4 mb-6">
                <span className="block w-10/12 min-h-12">
                    { !collapsed && (<img src={"/src/assets/imgs/login_image.png"}/>) }
                </span>
                <span onClick={() => setCollapsed(!collapsed)} className="mb-2 font-xl cursor-pointer">
                    {collapsed ? <ChevronsRight/> : <ChevronsLeft/>}
                </span>
            </div>

            <nav className="flex flex-col gap-3">
                <Link to="/home" className={`${standardClasses} ${location.pathname.includes("/home") ? activeClasses : ""}`}>
                    <House size={20} />
                    {!collapsed && <span>{t('GLOBAL.home')}</span>}
                </Link>

                <Link to="/settings" className={`${standardClasses} ${location.pathname.includes("/settings") ? activeClasses : ""}`}>
                    <Settings size={20} />
                    {!collapsed && <span>{t('GLOBAL.settings')}</span>}
                </Link>
            </nav>
        </aside>
    );
}
