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

import { Navigate, Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { PageTitle } from "../components/PageTitle";
import BreadCrumbTopbar from "../components/settings/TopBar";

import { useCustom } from "../services/custom/customContext";

export default function SettingsLayout() {
    let pathNameWithoutCustom: string = window.location.pathname.replace(useCustom() || "", "") || "/";
    pathNameWithoutCustom = pathNameWithoutCustom.replace("//", "/");
    if (pathNameWithoutCustom === "/") {
        if (sessionStorage.getItem('accessToken')) {
            return <Navigate to="/home" replace />;
        } else {
            if (window.location.pathname !== "/login") {
                return <Navigate to="/login" replace />;
            }
        }
    }

    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className='flex flex-col w-full h-full'>
                <PageTitle />
                <BreadCrumbTopbar />
                <span className='overflow-y-auto h-full'>
                    <Outlet />
                </span>
            </div>
        </div>
    );
}
