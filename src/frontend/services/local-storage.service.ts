import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {
    appSession: any = null;

    constructor() {
    }

    setAppSession(id: string) {
        this.appSession = id;
    }

    getAppSession(): string {
        return this.appSession;
    }

    save(id: string, content: any) {
        localStorage.setItem(id + '_' + this.getAppSession(), content);
    }

    get(id: string) {
        return localStorage.getItem(id + '_' + this.getAppSession());
    }

    remove(id: string) {
        localStorage.removeItem(id + '_' + this.getAppSession());
    }

    resetLocal() {
        const arr: string | any[] = [];
        // Iterate over arr and remove the items by key
        for (let i = 0; i < arr.length; i++) {
            localStorage.removeItem(arr[i]);
        }
    }
}
