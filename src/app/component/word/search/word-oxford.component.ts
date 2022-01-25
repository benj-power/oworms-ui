import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';

import { WordService } from '../../../service/word.service';

@Component({
    selector: 'ow-oxford-search',
    templateUrl: 'word-oxford.component.html',
    styleUrls: ['./word-oxford.component.scss']
})
export class WordOxfordComponent {

    wordDetailsJSON$: Observable<string> = of();
    readonly form: FormGroup = new FormGroup({
        theWord: new FormControl()
    });

    constructor(private readonly service: WordService,
                private readonly titleService: Title) {
        this.titleService.setTitle('oworms | oxford search');
    }

    searchClick(): void {
        const searchValue: string = this.form.get('theWord')?.value;

        if (!searchValue) {
            return;
        }

        this.wordDetailsJSON$ = this.service.retrieveFromOxford(searchValue);
    }
}
