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
import { ChevronsUpDown, CloudUpload, Moon, Package, Sun } from "lucide-react";

import { Button } from "./Button.tsx";


export default function TopBar() {
    const options = [
        {
            id: 'verifier',
            label: t('ONBOARD.verifier'),
            img: '/src/assets/imgs/Open-Capture_Verifier.svg'
        },
        {
            id: 'splitter',
            label: t('ONBOARD.splitter'),
            img: '/src/assets/imgs/Open-Capture_Splitter.svg'
        }
    ];

    const [selected, setSelected] = useState<string | null>(null);
    const [img, setImg] = useState<string | null>(null);

    const [darkMode, setDarkMode] = useState<boolean>(() => {
        return localStorage.getItem("theme") === "dark";
    });
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    const handleSelect = (option: string) => {
        setSelected(option);
        const optionInfo = options.find(o => o.id === option);
        if (optionInfo) {
            setImg(optionInfo['img'])
        }
        localStorage.setItem('selectedModule', option);
        window.dispatchEvent(new Event("local-storage"));
    };

    const storedModule = localStorage.getItem('selectedModule');
    if (storedModule && !selected) {
        handleSelect(storedModule)
    }

    return (
        <header className="w-full h-22 flex items-center justify-between px-6 bg-(--bg-primary) border-b-2 border-(--border-secondary)">
            <div className="flex items-center gap-4">
                <div className="relative inline-block w-64">
                    <select value={ selected || '' } style={{ backgroundImage: `url('${img}')` }}
                            onChange={(e) => { handleSelect(e.target.value)} }
                            className="w-full bg-size-[35px] bg-no-repeat bg-position-[8px] pl-[60px] cursor-pointer
                            rounded-lg py-3 border-2 border-(--border-secondary) appearance-none">
                        {
                            options.map((option) => (
                                <option value={option['id']}
                                    className="cursor-pointer px-4 py-2 hover:bg-(--bg-secondary)">
                                    {option['label']}
                                </option>
                            ))
                        }
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                        { <ChevronsUpDown size={20} /> }
                    </span>
                </div>
                <Button to="/home" icon={<Package size={24} className="mr-2"/>} className="font-semibold p-3!">
                    { t('GLOBAL.batches') }
                </Button>
                <Button to="/upload" icon={<CloudUpload size={24} className="mr-2"/>} className="font-semibold p-3!">
                    { t('GLOBAL.upload') }
                </Button>
            </div>
            <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative w-16 h-8 rounded-full border-2 
                  flex items-center transition-colors duration-300 border-(--border-secondary)`}
            >
      <span
          className={`absolute top-0.5 left-1 w-6 h-6 rounded-full flex items-center justify-center 
                    transition-transform duration-300 transform
                    ${darkMode ? "translate-x-8 bg-black" : "translate-x-0 bg-white"}`}
      >
        {darkMode ? (
            <Moon className="w-4 h-4 text-white" />
        ) : (
            <Sun className="w-4 h-4 text-(--color-primary)" />
        )}
      </span>
            </button>
        </header>
    );
}
