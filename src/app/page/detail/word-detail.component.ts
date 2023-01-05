import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';

import { AppRoutes } from '../../util/app.routes';

import { AlertService } from '../../service/alert.service';
import { UserService } from '../../service/user.service';
import { WordService } from '../../service/word.service';

import { ErrorUtil } from '../../util/error.util';

import { Tag } from '../../model/tag.interface';
import { User } from '../../model/user.interface';
import { Word } from '../../model/word.interface';

import { LoadComponent } from '../../component/common/spinner/load.component';

@Component({
    selector: 'ow-word-detail',
    templateUrl: 'word-detail.component.html',
    styleUrls: ['./word-detail.component.scss']
})
export class WordDetailComponent extends LoadComponent {

    readonly word$: Observable<Word>;
    tags: string[] = [];
    isLiked: boolean;

    constructor(private readonly service: WordService,
                private readonly router: Router,
                private readonly route: ActivatedRoute,
                private readonly titleService: Title,
                private readonly alertService: AlertService,
                readonly userService: UserService) {
        super();

        this.word$ = this.getWord();
    }

    navToStats(word: Word): void {
        const date: Date = new Date(word.creationDate);

        void this.router.navigate(
            [AppRoutes.STATS],
            { queryParams: { day: date.getDate(), month: date.getMonth(), year: date.getFullYear() } }
        );
    }

    edit({ uuid }: Word): void {
        void this.router.navigate([AppRoutes.getEdit(uuid)]);
    }

    likeWord($event: Event, word: Word): void {
        $event.preventDefault();
        $event.stopPropagation();

        this.service
            .like(word.uuid)
            .pipe(
                take(1),
                switchMap(() => this.userService.loadLoggedInUser(true)),
                take(1)
            )
            .subscribe({
                error: (e: HttpErrorResponse) => {
                    this.alertService.add(e.error.message, true);
                }
            });
    }

    private getWord(): Observable<Word> {
        this.state = 'loading';

        return this.route
            .paramMap
            .pipe(
                map((params: ParamMap) => params.get('uuid') ?? '0'),
                switchMap((uuid: string) => this.service.retrieve(uuid)),
                tap((word: Word) => {
                    this.tags = word.tags.map(({ name }: Tag) => name);
                    this.state = 'complete';
                    this.titleService.setTitle(`${word.theWord} - oworms`);
                }),
                switchMap((word: Word) => combineLatest([
                    of(word),
                    this.userService.getLoggedInUser()
                ])),
                map(([word, user]: [Word, User]) => {
                    if (user) {
                        this.isLiked = user.likedWordUUIDs.includes(word.uuid);
                    }

                    return word;
                }),
                catchError((e: HttpErrorResponse) => {
                    this.errorMessage = ErrorUtil.getMessage(e);
                    this.state = 'error';

                    return of(undefined);
                })
            );
    }
}
