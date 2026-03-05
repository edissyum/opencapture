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

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from '../../components/Button';

const stepModules = import.meta.glob("./step*.tsx", { eager: true });

export function Onboarding() {
    const { t } = useTranslation();

    const steps = Object.keys(stepModules).sort().map((path, index) => {
        const mod = stepModules[path] as Record<string, any>;

        const stepExportKey = Object.keys(mod).find((k) => k.startsWith("Step"));
        const Component = stepExportKey ? mod[stepExportKey] : null;

        return {
            id: index + 1,
            name: stepExportKey || `Step ${index + 1}`,
            component: Component,
        };
    }).filter((s) => s.component);

    const [completedSteps, _] = useState<number[]>(() => {
        try {
            const stored = localStorage.getItem("completedOnboardingSteps");
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const [currentStep, setCurrentStep] = useState(0);
    useEffect(() => {
        if (completedSteps.length !== 0) {
            for (let i = 0; i < steps.length; i++) {
                if (!completedSteps.includes(steps[i].id)) {
                    setCurrentStep(steps.length - 1);
                }
            }
        }
    }, [completedSteps]);

    const StepComponent = steps[currentStep]?.component;
    const next = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((s) => s + 1);
        }
    };

    const prev = () => {
        if (currentStep > 0) {
            setCurrentStep((s) => s - 1);
        }
    };

    const handleStart = () => {
        const completedSteps = steps.map((s) => s.id);
        localStorage.setItem('completedOnboardingSteps', JSON.stringify(completedSteps));
    };

    return (
        <div className="h-screen flex xl:items-center pt-4 xl:pt-0 justify-center bg-(--bg-secondary) overflow-y-scroll">
            <div className="w-6/12 flex flex-col gap-2">
                <h4 className="text-(--text-secondary)">{ t('ONBOARD.step') } { currentStep + 1 } { t('ONBOARD.on') } { steps.length }</h4>
                <div className="min-h-72">
                    <StepComponent />
                </div>
                <div className="flex justify-end mt-4">
                    {currentStep > 0 && <Button variant="no_bg" onClick={prev} className="mr-4">
                        { t('ONBOARD.prev') }
                    </Button>}

                    {currentStep < steps.length - 1 ? (
                        <Button variant="primary" onClick={next}>{ t('ONBOARD.next') }</Button>
                    ) : (
                        <Link to='/home'>
                            <Button onClick={handleStart} variant="primary">{ t('ONBOARD.start') }</Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}