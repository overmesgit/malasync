import { Injectable }    from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Title} from "./title";
import {Field} from "./field";
import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";

let init_fields: Field[] = [
  new Field("id", "Id", "Id", true, [0, 15000]),
  new Field("type", "Type", "Type", true, [0, 0]),
  new Field("title", "Title", "Title", true, [0, 0]),
  new Field("members_score", "Score", "Score", true, [0, 0]),
  new Field("aired_from", "Aired From", "From", true, [0, 0]),
  new Field("aired_to", "Aired To", "To", true, [0, 0]),
  new Field("duration", "Duration", "Dur.", false, [0, 0]),
  new Field("english", "English", "English", false, [0, 0]),
  new Field("episodes", "Episodes", "Ep.", false, [0, 0]),
  new Field("favorites", "Favorites", "Fav.", false, [0, 0]),
  new Field("genres", "Genres", "Genres", true, [0, 0]),
  new Field("image", "Image", "Image", false, [0, 0]),
  new Field("japanese", "Japanese", "Japanese", false, [0, 0]),
  new Field("members", "Members", "Members", true, [0, 0]),
  new Field("related", "Related", "Related", true, [0, 0]),
  new Field("producers", "Producers", "Producers", false, [0, 0]),
  new Field("rating", "Rating", "Rating", true, [0, 0]),
  new Field("scores", "Scores Count", "Scores", true, [0, 0]),
  new Field("status", "Status", "Status", true, [0, 0]),
  new Field("synopsis", "Synopsis", "Synopsis", false, [0, 0]),
];

@Injectable()
export class StateService {
  private headers = new Headers({'Content-Type': 'application/json'});
  private heroesUrl = '/api/title';
  public filteredTitles = new Subject<Title[]>();
  public allFields = init_fields;
  public fieldsTerms = new BehaviorSubject<Field[]>(init_fields.filter(f => f.enable));
  public currentPage = new BehaviorSubject(1);
  public titlesCount = new BehaviorSubject(1);

  constructor(private http: Http) {
    Observable.combineLatest(this.fieldsTerms.debounceTime(300), this.currentPage, (v1, v2) => [v1, v2])
      .distinctUntilChanged().subscribe(values => this.fetch(values[0] as Field[], values[1] as number));
  }

  next(response: any): void {
    this.filteredTitles.next(response.data as Title[]);
    this.titlesCount.next(response.meta.count);
  }

  fetch(fields: Field[], page: number): void {
    let options = new RequestOptions({ headers: this.headers });
    this.http.post(this.heroesUrl, this.getQuery(fields, page), options).toPromise()
      .then(response => this.next(response.json()))
      .catch(this.handleError);
  }

  getQuery(fields: Field[], page: number): any {
    let limit = 100;
    let offset = (page-1)*limit;
    let query = {offset, limit};
    query['fields'] = [];
    for(let f of fields) {
      query['fields'].push({'field': f.field, 'filter': f.filter})
    }
    return query;
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
