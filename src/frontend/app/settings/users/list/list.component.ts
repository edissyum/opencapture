import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { UserService } from "../../../../services/user.service";
import { AuthService } from "../../../../services/auth.service";
import { NotificationService } from "../../../../services/notifications/notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { catchError, tap } from "rxjs/operators";
import { API_URL } from "../../../env";
import { of } from "rxjs";

@Component({
    selector: 'app-users-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class UserListComponent implements OnInit {
    columnsToDisplay: string[]    = ['id', 'username', 'firstname', 'lastname', 'role','status', 'actions'];
    users : any                   = [];
    pageSize : number             = 10;
    total: number                 = 0;

    constructor(
        private http: HttpClient,
        private router: Router,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        public userService: UserService,
        private translate: TranslateService,
        private notify: NotificationService,
    ) { }


    ngOnInit(): void {
        this.loadUsers()
    }

    onPageChange(event: any){
        this.pageSize = event.pageSize
        let offset = this.pageSize * (event.pageIndex)
        this.loadUsers(offset)
    }

    loadUsers(offset: any = 0): void{
        let headers = this.authService.headers;
        let roles: never[] = []
        this.http.get(API_URL + '/ws/roles/get', {headers}).pipe(
            tap((data: any) => {
                roles = data
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()

        this.http.get(API_URL + '/ws/user/list?limit=' + this.pageSize + '&offset=' + offset, {headers}).pipe(
            tap((data: any) => {
                this.total = data.users[0].total
                this.users = data.users;
                if (roles){
                    this.users.forEach((user: any) => {
                        roles.forEach((element: any) => {
                            if (user.role == element.id){
                                user.role_label = element.label
                            }
                        })
                    });
                }
            }),
            catchError((err: any) => {
                console.debug(err);
                this.notify.handleErrors(err);
                return of(false);
            })
        ).subscribe()
    }

}
