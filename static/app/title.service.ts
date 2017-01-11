import { Injectable }    from '@angular/core';
import {Headers, Http, Response, RequestOptions} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {Title} from "./title";
import {FieldService} from "./field.service";
import {Observable, BehaviorSubject} from "rxjs";
import {Field} from "./field";
@Injectable()
export class TitleService {
  private headers = new Headers({'Content-Type': 'application/json'});
  private heroesUrl = '/api/title';
  public filteredTitles: Observable<Title[]>;

  constructor(private http: Http,
    private fieldService: FieldService) {
    this.filteredTitles = this.fieldService.fieldsTerms.debounceTime(300)
      .distinctUntilChanged()
      .switchMap(fields => this.fetch(fields));
  }

  fetch(fields: Field[]): Observable<Title[]> {
    let options = new RequestOptions({ headers: this.headers });
    return this.http.post(this.heroesUrl, {fields}, options).map((r: Response) => r.json().data as Title[])
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
