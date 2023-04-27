import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { filter, map, take } from 'rxjs/operators';

import { AlertService } from '../../../service/alert.service';
import { UserService } from '../../../service/user.service';
import { WordService } from '../../../service/word.service';

import { AppRoutes } from '../../../util/app.routes';
import { Unsubscribes } from '../../../util/auto-unsubscribe.directive';

import { Word } from '../../../model/word.interface';
import { User } from '../../../model/user.interface';

@Component({
    selector: 'ow-word-card',
    templateUrl: './word-card.component.html',
    styleUrls: ['./word-card.component.scss']
})
@Unsubscribes()
export class WordCardComponent {

    @Input()
    word: Word;

    private likedWordUUIDs: string[] = [];

    constructor(private readonly router: Router,
                private readonly wordService: WordService,
                private readonly alertService: AlertService,
                private readonly userService: UserService) {
        this.userService
            .getLoggedInUser()
            .pipe(
                filter((user: User) => !!user),
                map(({ likedWords }: User) => likedWords.map((word: Word) => word.uuid))
            )
            .subscribe({
                next: (likedWordUUIDs: string[]) => {
                    this.likedWordUUIDs = likedWordUUIDs;
                }
            });
    }

    get isLiked(): boolean {
        return this.likedWordUUIDs?.includes(this.word.uuid);
    }

    likeWord($event: Event, word: Word): void {
        $event.preventDefault();
        $event.stopPropagation();

        this.userService
            .likeWord(word.uuid)
            .pipe(take(1))
            .subscribe({
                next: () => {
                    if (this.isLiked) {
                        this.alertService.add('liked word successfully')
                    } else {
                        this.alertService.add('unliked word successfully');
                    }
                },
                error: (e: HttpErrorResponse) => {
                    this.alertService.add(e.error.message, true);
                }
            });
    }

    getViews(daWord: Word): string {
        switch (daWord?.timesViewed) {
            case 0:
                return 'No views';
            case 1:
                return '1 view';
            case null:
                return 'n/a';
            default:
                return daWord.timesViewed + ' views';
        }
    }

    viewWordDetails(): void {
        void this.router.navigate([AppRoutes.getDetail(this.word.uuid)]);
    }
}
