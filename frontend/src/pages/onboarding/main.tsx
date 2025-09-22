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

import { useState } from "react";

import { Step1 } from "./step1.tsx";
import { Step2 } from "./step2.tsx";

import { Button } from '../../components/Button';
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function Onboarding() {
    const { t } = useTranslation();

    const steps = [Step1, Step2];
    const [currentStep, setCurrentStep] = useState(0);

    const StepComponent = steps[currentStep];

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
        localStorage.setItem('onboardingCompleted', 'true');
        window.dispatchEvent(new Event("local-storage"));
    };

    return (
        <div className="h-screen flex items-center justify-center bg-(--bg-secondary)">
            <div className="w-6/12 flex flex-col gap-2">
                <h4 className="text-(--text-secondary)">{ t('ONBOARD.step') } { currentStep + 1 } { t('ONBOARD.on') } { steps.length }</h4>
                <StepComponent />
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