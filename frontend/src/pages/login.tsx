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

import { Button } from '../components/Button';
import { Input } from "../components/Input.tsx";
import {toast} from "react-toastify";

export function Login() {

    const handleLogin = () => {
        toast.warning('🦄 Wow so easy!', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
        localStorage.setItem("token", "fake-jwt-token");
        // window.location.href = "/dashboard";
    };

    return (
        <div className='dark'>
            <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <img src={"/src/assets/imgs/login_image.png"} alt="Open-Capture" className="mx-auto" />
                    <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">{t("GLOBAL.login")}</h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6">
                        <div className="mt-2">
                            <Input id="username" type="text" name="username" required label={ t('USER.username') }/>
                        </div>
                        <div>
                            <Input id="password" type="text" name="password" required label={ t('USER.password') }/>
                        </div>

                        <div className="text-center">
                            <Button type="button" size='md' className="w-full" onClick={handleLogin}>
                                { t('AUTH.login') }
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
