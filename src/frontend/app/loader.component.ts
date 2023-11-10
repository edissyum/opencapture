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

@dev : Nathan Cheval <nathan.cheval@outlook.fr> */

import { Component } from '@angular/core';

@Component({
    selector: 'app-loader',
    template:
        '<div class="w-full h-full">' +
        '    <div id="preloader" class="absolute inset-0 bg-white z-30">' +
        '            <div id="status" class="flex absolute items-center justify-center w-full h-0 top-1/2">' +
        '                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 74.4 81.9" width="300"' +
        '                     height="300">' +
        '                    <linearGradient id="fill" x1="0.5" y1="1" x2="0.5" y2="0">' +
        '                        <stop offset="0%" stop-color="#76B442">' +
        '                            <animate attributeName="stop-color" values="#76B442; #A7A8AA; #76B442" dur="1s"' +
        '                                     repeatCount="indefinite"></animate>' +
        '                        </stop>' +
        '                        <stop offset="100%" stop-color="#A7A8AA">' +
        '                            <animate attributeName="stop-color" values="#A7A8AA; #76B442; #A7A8AA" dur="1s"' +
        '                                     repeatCount="indefinite"></animate>' +
        '                        </stop>' +
        '                    </linearGradient>' +
        '                    <path fill="url(#fill)" d="M1.9,79.4c-1.5-1.5,0.3-4.7,8.2-14.2c4.8-5.7,10.1-12.3,11.9-14.6l3.3-4.1l-1.6-1.7' +
        '                            c-7.2-7.4-8.6-20.6-3-29.7C27.9,3.4,43.8-1.4,56.8,4.2c6,2.6,11.8,8,14.4,13.5c2.7,5.6,2.5,15.4-0.4,21.1' +
        '                            c-6.6,13-22.8,18.9-36.3,13.3c-2.2-1-4.1-1.3-4.4-1c-0.3,0.4-5.8,7-12.2,14.8C8.8,76.8,5.7,80,4.3,80C3.3,80,2.1,79.7,1.9,79.4' +
        '                            L1.9,79.4z M53.5,48.8c5.7-2,10.7-6.3,13.4-11.3c2.8-5.2,2.9-13.8,0.1-18.9c-4.5-8.4-12-12.8-21.9-12.8c-26.3,0-33.2,33.2-9,42.7' +
        '                            C42.2,50.9,47.3,51,53.5,48.8L53.5,48.8z"></path>' +
        '            </svg>' +
        '        </div>' +
        '    </div>' +
        '</div>'
})

export class LoaderComponent  {}
