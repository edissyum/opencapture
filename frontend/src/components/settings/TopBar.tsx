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
import { NavLink, useMatches } from "react-router-dom";

import { ChevronRight } from "lucide-react";

export default function TopBarSettings() {
    const matches = useMatches();
    const breadcrumbs = matches.filter((m) => m.handle && m.handle?.breadcrumb);

    return (
        <header
            className="w-full h-22 flex items-center justify-between px-6 border-b-2 border-(--border-secondary) text-(--text-secondary)">
            <div className="flex items-center gap-4">
                { breadcrumbs.map((match, idx) => {
                    const isLast = idx === breadcrumbs.length - 1;
                    return (
                        <span key={ match.pathname } className="flex items-center gap-2">
                            { !isLast ? (
                                <NavLink to={ match.pathname } className="text-(--text-primary)!">
                                    { t( match.handle?.breadcrumb) }
                                </NavLink>
                            ) : (
                                <span className="text-(--text-secondary)">
                                    { t(match.handle?.breadcrumb) }
                                </span>
                            ) }
                            { !isLast && <span><ChevronRight size={18}/></span> }
                        </span>
                    );
                }) }
            </div>
        </header>
    );
}
