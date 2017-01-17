import { Injectable }    from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Title} from "./title";
import {Field} from "./field";
import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";

let typeValues = [ "TV", "Movie", "OVA", "Special",
  "ONA", "Music", "Doujin",
  "Manhwa", "Manhua", "Novel",
  "One Shot", "Manga"
];

let initFields: Field[] = [
  new Field("id", "Id", "Id", true).withSorting().withNumFilter(1, 90000, 1),
  new Field("type", "Type", "Type", true).withSelectFilter(typeValues),
  new Field("title", "Title", "Title", true),
  new Field("members_score", "Score", "Score", true).withSorting().withNumFilter(1, 10, 0.1),
  new Field("aired_from", "Aired From", "From", true).withSorting(),
  new Field("aired_to", "Aired To", "To", true).withSorting(),
  new Field("duration", "Duration", "Dur.", false).withSorting().withNumFilter(1, 500, 1),
  new Field("english", "English", "English", false),
  new Field("episodes", "Episodes", "Ep.", false).withSorting().withNumFilter(1, 3000, 1),
  new Field("favorites", "Favorites", "Fav.", false).withNumFilter(1, 100000, 1),
  new Field("genres", "Genres", "Genres", true),
  new Field("image", "Image", "Image", false),
  new Field("japanese", "Japanese", "Japanese", false),
  new Field("members", "Members", "Members", true).withSorting().withNumFilter(1, 500000, 1),
  new Field("related", "Related", "Related", true),
  new Field("producers", "Producers", "Producers", false),
  new Field("rating", "Rating", "Rating", true),
  new Field("scores", "Scores Count", "Scores", true).withSorting().withNumFilter(1, 800000, 1),
  new Field("status", "Status", "Status", true),
  new Field("synopsis", "Synopsis", "Synopsis", false),
];

@Injectable()
export class StateService {
  private headers = new Headers({'Content-Type': 'application/json'});
  private heroesUrl = '/api/title';
  public filteredTitles = new Subject<Title[]>();
  public allFields = initFields;
  public fieldsTerms = new BehaviorSubject<Field[]>(initFields.filter(f => f.enable));
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
      query['fields'].push(f.getQuery())
    }
    return query;
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
