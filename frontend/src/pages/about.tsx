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
import { Panel } from "primereact/panel";
import { useEffect, useState } from "react";
import { ArrowRight, Building2, CircleAlert, Code, Cpu, Library, Shield, Tag, Users } from "lucide-react";

import packageJson from '../../package.json';
import { axiosApiCall } from "../services/hooks/axiosApiCall";

import { Button } from "../components/Button";
import { Loader } from "../components/loader/Loader";

export function AboutPage() {
    const { get } = axiosApiCall();
    const [loading, setLoading] = useState(true);

    const logo = "/src/assets/imgs/login_image.svg"

    const [backendPackages, setBackendPackages] = useState<any>([]);
    const [frontendPackages, setFrontendPackages] = useState<any>([]);
    const [lastVersion, setLastVersion] = useState<string>('');

    // Fetch latest version and backend packages on component mount
    useEffect(() => {
        setFrontendPackages(packageJson.dependencies);
        setFrontendPackages((prev: any) => ({ ...prev, ...packageJson.devDependencies }));

        const fetchLatestVersion = async () => {
            try {
                const response = await get('/config/gitInfo');
                if (response.git_latest) {
                    setLastVersion(response.git_latest);
                } else {
                    setLastVersion('error');
                }
            } catch (error) {
                setLastVersion('error');
                console.error('Error fetching latest version:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchBackendPackages = async () => {
            try {
                const response = await get('/config/packages');
                setBackendPackages(response.packages);
            } catch (error) {
                console.error('Error fetching backend packages:', error);
            }
        };

        fetchLatestVersion().then();
        fetchBackendPackages().then();
    }, []);

    const classes = 'flex items-center px-6 py-3';
    const classesWithBorder = `${ classes } border-b border-(--border-secondary)`;

    if (loading) return <Loader/>;

    return (
        <div className="p-6 w-full h-full flex justify-center overflow-scroll bg-(--bg-secondary)">
            <div className='w-1/2 flex flex-col items-center gap-4'>
                <div className='w-full flex flex-col gap-4 pb-4 items-center'>
                    <>
                        <div
                            className='bg-(--bg-primary) border border-(--border-secondary) rounded-2xl pt-6 pb-4 px-8'>
                            <img src={ logo } className='w-full' alt="Open-Capture Logo"/>
                        </div>
                        <div className='mt-2 mb-4 text-(--text-secondary)'>
                            Logiciel libre de capture et gestion documentaire
                        </div>
                        <div className='flex items-center gap-4'>
                            <div className='bg-(--bg-primary) border border-(--border-secondary) rounded-lg p-2 py-1
                                            flex items-center gap-2 w-fit'>
                                <Tag size={ 18 }/>
                                { packageJson.version }
                            </div>
                            <a href={ `${ packageJson.repository }/releases/tag/${ packageJson.version }` }
                               target='_blank'
                               className='w-fit text-(--text-secondary) text-md flex items-center gap-0.5 cursor-pointer hover:text-(--color-primary)'>
                                { t('ABOUT.see_changelog') }
                                <ArrowRight size={ 20 }/>
                            </a>
                        </div>
                    </>
                    <div className='w-full'>
                        { lastVersion === 'error' && (
                            <div
                                className="bg-(--text-error)/10 border-(--text-error) border rounded-lg p-4 flex items-center">
                                <div className='bg-(--text-error) p-2 rounded-lg'>
                                    <CircleAlert className="text-white" size={ 24 }/>
                                </div>
                                <div className="ml-4 text-(--text-error)">
                                    { t('ABOUT.version_check_error') }
                                </div>
                            </div>
                        ) }
                        { lastVersion !== 'error' && lastVersion > packageJson.version && (
                            <div
                                className="bg-(--color-primary)/10 border-(--border-primary)/10 border rounded-lg p-4 flex items-center">
                                <div className='bg-(--color-primary) p-2 rounded-lg'>
                                    <CircleAlert className="text-white" size={ 24 }/>
                                </div>
                                <div>
                                    <div className="ml-4 text-(--color-primary) font-semibold">
                                        { t('ABOUT.update_available') }
                                    </div>
                                    <div className="ml-4 text-(--text-secondary) text-sm">
                                        Version <strong className='text-(--text-primary)'>{ lastVersion }</strong>
                                    </div>
                                </div>
                                <div className='ml-auto'>
                                    <a target='_blank'
                                       href={ `${ packageJson.repository }/releases/tag/${ lastVersion }` }>
                                        <Button variant="primary">
                                            { t('ABOUT.see_on_github') }
                                            <ArrowRight size={ 18 } className='ml-2'/>
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        ) }
                    </div>
                    <div className='w-full flex flex-col gap-4'>
                        <Panel header={
                            <div className='flex items-center gap-3 text-(--text-secondary)'>
                                <Shield/> { t('ABOUT.license_desc') }
                            </div>
                        }>
                            <>
                                <div className={ `${ classesWithBorder }` }>
                                    <p className='w-1/3'>Type</p>
                                    <p className='text-(--color-primary)'>GNU General Public License v3.0</p>
                                </div>
                                <div className={ `${ classes }` }>
                                    <p className='w-1/3'>{ t('ABOUT.status') }</p>
                                    <p className='text-(--text-primary)'>{ t('ABOUT.license_status') }</p>
                                </div>
                            </>
                        </Panel>

                        <Panel header={
                            <div className='flex items-center gap-3 text-(--text-secondary)'>
                                <Building2/> { t('ABOUT.editor') }
                            </div>
                        }>
                            <>
                                <div className={ `${ classesWithBorder }` }>
                                    <p className='w-1/3'>{ t('ABOUT.society') }</p>
                                    <p className='text-(--text-primary)'>Edissyum Consulting</p>
                                </div>
                                <div className={ `${ classesWithBorder }` }>
                                    <p className='w-1/3'>{ t('ABOUT.address') }</p>
                                    <p className='text-(--text-primary)'>98 Avenue Pierre Semard, 84200 Carpentras</p>
                                </div>
                                <div className={ `${ classesWithBorder }` }>
                                    <p className='w-1/3'>{ t('ABOUT.software') }</p>
                                    <a className='text-(--color-primary)' href='https://edissyum.com' target='_blank'>
                                        https://edissyum.com
                                    </a>
                                </div>
                                <div className={ `${ classesWithBorder }` }>
                                    <p className='w-1/3'>{ t('ABOUT.software_website') }</p>
                                    <a className='text-(--color-primary)' href='https://open-capture.com'
                                       target='_blank'>
                                        https://open-capture.com
                                    </a>
                                </div>
                                <div className={ `${ classesWithBorder }` }>
                                    <p className='w-1/3'>{ t('ABOUT.documentation') }</p>
                                    <a className='text-(--color-primary)'
                                       href='https://edissyum.gitbook.io/open-capture' target='_blank'>
                                        https://edissyum.gitbook.io/open-capture
                                    </a>
                                </div>
                                <div className={ `${ classes }` }>
                                    <p className='w-1/3'>{ t('ABOUT.support') }</p>
                                    <a className='text-(--color-primary)'
                                       href='https://github.com/edissyum/opencapture/issues' target='_blank'>
                                        https://github.com/edissyum/opencapture/issues
                                    </a>
                                </div>
                            </>
                        </Panel>

                        <Panel header={
                            <div className='flex items-center gap-3 text-(--text-secondary)'>
                                <Users/> { t('ABOUT.team') }
                            </div>
                        }>
                            <>
                                <div className={ `${ classesWithBorder }` }>
                                    <div className='rounded-full bg-(--color-primary)/15 font-semibold
                                                    text-(--color-primary) border border-(--border-primary) p-3'>
                                        NC
                                    </div>
                                    <div className='ml-4'>
                                        <p className='font-semibold'>Nathan CHEVAL</p>
                                        <p className='text-(--text-secondary) text-sm'>{ t('ABOUT.lead_dev') }</p>
                                    </div>
                                    <div className='ml-auto rounded-2xl bg-(--color-primary)/15 font-semibold
                                                    text-(--color-primary) border border-(--border-primary) px-3'>
                                        LEAD DEV
                                    </div>
                                </div>
                                <div className={ `${ classesWithBorder }` }>
                                    <div className='rounded-full bg-[#426CF5]/15 font-semibold
                                                    text-[#426CF5] border border-[#426CF5] p-3'>
                                        AM
                                    </div>
                                    <div className='ml-4'>
                                        <p className='font-semibold'>Arthur MONDON</p>
                                        <p className='text-(--text-secondary) text-sm'>{ t('ABOUT.mondon') }</p>
                                    </div>
                                    <div className='ml-auto flex gap-1'>
                                        <div className='rounded-2xl bg-[#426CF5]/15 font-semibold
                                                    text-[#426CF5] border border-[#426CF5] px-3'>
                                            UX / UI
                                        </div>
                                        <div className='rounded-2xl bg-(--bg-secondary) font-semibold
                                                    text-(--text-secondary) border border-(--border-secondary) px-3'>
                                            DEV
                                        </div>
                                    </div>
                                </div>
                                <div className={ `${ classesWithBorder }` }>
                                    <div className='rounded-full bg-[#D53232]/15 font-semibold
                                                    text-[#D53232] border border-[#D53232] p-3'>
                                        AM
                                    </div>
                                    <div className='ml-4'>
                                        <p className='font-semibold'>Amandine MILLET</p>
                                        <p className='text-(--text-secondary) text-sm'>{ t('ABOUT.misc_dev') }</p>
                                    </div>
                                    <div className='ml-auto rounded-2xl bg-(--bg-secondary) font-semibold
                                                    text-(--text-secondary) border border-(--border-secondary) px-3'>
                                        DEV
                                    </div>
                                </div>
                                <div className={ `${ classesWithBorder }` }>
                                    <div className='rounded-full bg-[#A76227]/15 font-semibold
                                                    text-[#A76227] border border-[#A76227] p-3'>
                                        PY
                                    </div>
                                    <div className='ml-4'>
                                        <p className='font-semibold'>Pierre-Yvon BEZERT</p>
                                        <p className='text-(--text-secondary) text-sm'>{ t('ABOUT.docker') }</p>
                                    </div>
                                    <div className='ml-auto rounded-2xl bg-[#1CC7BE]/15 font-semibold
                                                    text-[#1CC7BE] border border-[#1CC7BE] px-3'>
                                        DOCKER
                                    </div>
                                </div>
                                <div className={ `${ classes }` }>
                                    <div className='rounded-full bg-(--bg-secondary) font-semibold
                                                    text-(--text-secondary) border border-(--border-secondary) p-3'>
                                        OB
                                    </div>
                                    <div className='ml-4'>
                                        <p className='font-semibold'>Oussama BRICH</p>
                                        <p className='text-(--text-secondary) text-sm'>{ t('ABOUT.splitter_dev') }</p>
                                    </div>
                                    <div className='ml-auto rounded-2xl bg-(--bg-secondary) font-semibold
                                                    text-(--text-secondary) border border-(--border-secondary) px-3'>
                                        DEV
                                    </div>
                                </div>
                            </>
                        </Panel>

                        <Panel header={
                            <div className='flex items-center gap-3 text-(--text-secondary)'>
                                <Code/> { t('ABOUT.technical_infos') }
                            </div>
                        }>
                            <div className={ `${ classesWithBorder }` }>
                                <p className='w-1/3'>Backend</p>
                                <p className='text-(--text-primary)'>Python &gt;= 3.13 & Flask</p>
                            </div>
                            <div className={ `${ classesWithBorder }` }>
                                <p className='w-1/3'>Frontend</p>
                                <p className='text-(--text-primary)'>React + Vite</p>
                            </div>
                            <div className={ `${ classesWithBorder }` }>
                                <p className='w-1/3'>{ t('ABOUT.database') }</p>
                                <p className='text-(--text-primary)'>PostgreSQL</p>
                            </div>
                            <div className={ `${ classes }` }>
                                <p className='w-1/3'>{ t('ABOUT.ocr') }</p>
                                <p className='text-(--text-primary)'>Tesseract &gt;= 5 + OpenCV</p>
                            </div>
                        </Panel>

                        <Panel header={
                            <div className='flex items-center gap-3 text-(--text-secondary)'>
                                <Library/> { t('ABOUT.lib_front') }
                            </div>
                        }>
                            <div className={ `${ classes } py-0! px-0! grid grid-cols-2` }>
                                { Object.keys(frontendPackages).map((key: any, index: any) => (
                                    <div key={ index }
                                         className={ `w-full border-b border-(--border-secondary) 
                                                      flex justify-between py-3 px-4 
                                                      ${ index % 2 === 0 ? 'border-r' : '' }
                                                      ${ index >= Object.keys(frontendPackages).length - 2 ? 'border-b-0!' : '' }`
                                         }>
                                        <div className='font-semibold flex items-center gap-2'>
                                            <div className='bg-(--color-primary) rounded-full size-1.5'/>
                                            { key }
                                        </div>
                                        <div className='ml-auto text-(--text-secondary)'>
                                            {/*@ts-ignore*/ }
                                            { frontendPackages[key] }
                                        </div>
                                    </div>
                                )) }
                            </div>
                        </Panel>

                        <Panel header={
                            <div className='flex items-center gap-3 text-(--text-secondary)'>
                                <Cpu/> { t('ABOUT.lib_backend') }
                            </div>
                        }>
                            <div className={ `${ classes } py-0! px-0! grid grid-cols-2` }>
                                { Object.keys(backendPackages).map((key: any, index: any) => (
                                    <div key={ index }
                                         className={ `w-full border-b border-(--border-secondary) 
                                                      flex justify-between py-3 px-4 
                                                      ${ index % 2 === 0 ? 'border-r' : '' }
                                                      ${ index === Object.keys(backendPackages).length - 1 ? 'border-b-0!' : '' }`
                                         }>
                                        <div className='font-semibold flex items-center gap-2'>
                                            <div className='bg-(--color-primary) rounded-full size-1.5'/>
                                            { backendPackages[key].split('==')[0] }
                                        </div>
                                        <div className='ml-auto text-(--text-secondary)'>
                                            { backendPackages[key].split('==')[1] }
                                        </div>
                                    </div>
                                )) }
                            </div>
                        </Panel>
                    </div>
                </div>
            </div>
        </div>
    );
}