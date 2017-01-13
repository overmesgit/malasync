import { Injectable }    from '@angular/core';
import {Headers, Http, Response, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {Title} from "./title";
import {FieldService} from "./field.service";
import {Subject} from "rxjs/Subject";
import {Field} from "./field";
import Any = jasmine.Any;

@Injectable()
export class TitleService {
  private headers = new Headers({'Content-Type': 'application/json'});
  private heroesUrl = '/api/title';
  public filteredTitles = new Subject<Title[]>();

  constructor(private http: Http,
    private fieldService: FieldService) {
    this.fieldService.fieldsTerms.debounceTime(300)
      .distinctUntilChanged()
      .subscribe(fields => this.fetch(fields, this.fieldService.currentPage.getValue()));

    this.fieldService.currentPage
      .distinctUntilChanged()
      .subscribe(page => this.fetch(this.fieldService.fieldsTerms.getValue(), page));
  }

  next(response: any): void {
    this.filteredTitles.next(response.data as Title[]);
    this.fieldService.titlesCount.next(response.meta.count);
  }

  fetch(fields: Field[], page: number): void {
    let options = new RequestOptions({ headers: this.headers });
    this.http.post(this.heroesUrl, {fields, offset: (page-1)*100, limit: 100}, options).toPromise()
      .then(response => this.next(response.json()))
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
