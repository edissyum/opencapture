import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {
    constructor() {}

    save(id: string, content: any) {
        localStorage.setItem(id, content);
    }

    get(id: string) {
        return localStorage.getItem(id);
    }

    remove(id: string) {
        localStorage.removeItem(id);
    }

    resetLocal() {
        const arr: string | any[] = [];
        // Iterate over arr and remove the items by key
        for (let i = 0; i < arr.length; i++) {
            localStorage.removeItem(arr[i]);
        }
    }

    getCookie(cname: string) {
        const name = cname + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    setCookie(cname: string, cvalue: string, exdays: number) {
        const d = new Date();
        if (exdays !== 0) {
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            const expires = "expires=" + d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;SameSite=Strict";
        } else {
            document.cookie = cname + "=" + cvalue + ";path=/;SameSite=Strict";
        }
    }

    deleteCookie(cname: string) {
        this.setCookie(cname, '', -1);
    }
}
