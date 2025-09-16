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


export default function TopBar() {
    return (
        <header className="w-full h-22 flex items-center justify-between px-6 bg-white border-b shadow-sm">

            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {sessionStorage.getItem("username") || "Utilisateur"}
                </span>
                <button className="px-3 py-1 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                >
                    Déconnexion
                </button>
            </div>
        </header>
    );
}
