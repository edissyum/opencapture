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

import { Navigate, Outlet, useLocation } from "react-router-dom";

import TopBar from "../components/TopBar";
import Sidebar from "../components/Sidebar";

import { useCustom } from "../services/custom/customContext";
import { PageTitle } from "../components/PageTitle.tsx";

export default function MainLayout() {
    const location = useLocation();

    let pathNameWithoutCustom: string = location.pathname.replace(useCustom() || "", "") || "/";
    pathNameWithoutCustom = pathNameWithoutCustom.replace("//", "/");
    if (pathNameWithoutCustom === "/") {
        if (sessionStorage.getItem('accessToken')) {
            return <Navigate to="/home" replace/>;
        } else {
            if (location.pathname !== "/login") {
                return <Navigate to="/login" replace/>;
            }
        }
    }

    return (
        <div className="flex h-screen w-screen">
            <Sidebar/>
            <main className="flex flex-col w-full h-full bg-(--bg-secondary) overflow-hidden">
                <PageTitle />
                { !location.pathname.includes('verifier/viewer/') && !location.pathname.includes('splitter/viewer/') && (
                    <TopBar/>
                ) }
                <Outlet/>
            </main>
        </div>
    );
}
