import {Injectable}    from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Title, Related} from "./title";
import {Field} from "./field";
import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";

let typeValues = [ "TV", "Movie", "OVA", "Special",
  "ONA", "Music", "Doujinshi",
  "Manhwa", "Manhua", "Novel",
  "One-shot", "Manga"
];

let genres = ['Action', 'Adventure', 'Cars', 'Comedy', 'Dementia', 'Demons', 'Doujinshi', 'Drama',
              'Ecchi', 'Fantasy', 'Game', 'Gender Bender', 'Harem', 'Hentai', 'Historical', 'Horror', 'Josei', 'Kids',
              'Magic', 'Martial Arts', 'Mecha', 'Military', 'Music', 'Mystery', 'Parody', 'Police', 'Psychological',
              'Romance', 'Samurai', 'School', 'Sci-Fi', 'Seinen', 'Shoujo', 'Shoujo Ai', 'Shounen', 'Shounen Ai',
              'Slice of Life', 'Space', 'Sports', 'Super Power', 'Supernatural', 'Thriller', 'Vampire', 'Yaoi', 'Yuri'
];

let statuses = ["Not yet aired", "Currently Airing", "Finished Airing", "Not yet published", "Publishing", "Finished"];


let initFields: Field[] = [
  new Field("image", "Image", "Image", true),
  new Field("type", "Type", "Type", true).withSelectFilter(typeValues),
  new Field("title", "Title", "Title", true),
  new Field("members_score", "Score", "Score", true).withSorting('desc').withNumFilter(1, 10, 0.1, [1, 10]),
  new Field("aired_from", "Aired From", "From", true).withSorting().withDateFilter(),
  new Field("aired_to", "Aired To", "To", true).withSorting().withDateFilter(),
  new Field("english", "English", "English", false),
  new Field("synopsis", "Synopsis", "Synopsis", false),
  new Field("status", "Status", "Status", true).withSelectFilter(statuses),
  new Field("genres", "Genres", "Genres", true).withSelectFilter(genres),
  new Field("related", "Related", "Related", false),
  new Field("scores", "Scores Count", "Scores", false).withSorting().withNumFilter(1, 800000, 1, [1000, 800000]),
  new Field("members", "Members", "Members", false).withSorting().withNumFilter(1, 500000, 1),
  new Field("favorites", "Favorites", "Fav.", false).withNumFilter(1, 100000, 1),
  new Field("japanese", "Japanese", "Japanese", false),
  new Field("producers", "Producers", "Producers", false),
  new Field("authors", "Authors", "Authors", false),
  new Field("serialization", "Serialization", "Serialization", false),
  new Field("rating", "Rating", "Rating", false),
  new Field("id", "Id", "Id", false).withSorting(),
  new Field("episodes", "Episodes", "Ep.", false).withSorting().withNumFilter(1, 3000, 1),
  new Field("duration", "Duration", "Dur.", false).withSorting().withNumFilter(1, 500, 1),
  new Field("chapters", "Chapters", "Chapters", false).withSorting().withNumFilter(1, 15000, 1),
  new Field("volumes", "Volumes", "Volumes", false).withSorting().withNumFilter(1, 500, 1),
];

@Injectable()
export class StateService{
  private headers = new Headers({'Content-Type': 'application/json'});
  private heroesUrl = '/api/title';
  public filteredTitles = new Subject<Title[]>();
  public allFields = initFields;
  public fieldsTerms = new BehaviorSubject<Field[]>(initFields.filter(f => f.enable));
  public queryTerms = new BehaviorSubject<Field[]>(initFields);
  public currentPage = new BehaviorSubject(1);
  public titlesCount = new BehaviorSubject(1);
  private localStorage = localStorage;
  private limit = 100;
  public initCopy: Field[];

  constructor(private http: Http) {
    this.initCopy = this.duplicateFieldArray(initFields);

    if (!('version' in this.localStorage)) {
      this.localStorage['version'] = 1;
    }

    if ('page' in this.localStorage) {
      this.currentPage = new BehaviorSubject(parseInt(this.localStorage['page'], 10));
    }

    if ('fields' in this.localStorage) {
      let stored = JSON.parse(this.localStorage['fields']);
      this.replaceFields(stored);
    }

    Observable.combineLatest(this.queryTerms.debounceTime(300), this.currentPage, (v1, v2) => [v1, v2])
      .distinctUntilChanged().subscribe(values => this.fetch(values[0] as Field[], values[1] as number));
    this.currentPage.subscribe(value => this.updatePageHistory(value as number));
    this.fieldsTerms.subscribe(value => this.updateFieldsHistory(value as Field[]));
  }

  duplicateFieldArray(fields: Field[]) {
    let res: Field[] = [];
    for (let f of fields) {
      let d = new Field('', '', '', false);
      for (let prop in f) d[prop] = f[prop];
      res.push(d);
    }
    return res;
  }

  replaceFields(fields: Field[]): void {
    this.allFields.splice(0, this.allFields.length);
    for (let f of fields) {
      let d = new Field('', '', '', false);
      for (let prop in f) d[prop] = f[prop];
      this.allFields.push(d);
    }
    this.queryTerms.next(this.allFields);
    this.fieldsTerms.next(this.allFields.filter(f => f.enable));

  }

  updatePageHistory(page: number): void {
    this.localStorage['page'] = page;
  }

  updateFieldsHistory(enabledFields: Field[]) {
    this.localStorage['fields'] = JSON.stringify(this.allFields);
  }

  next(response: any): void {
    let titles = Title.fromJson(response.data);

    this.filteredTitles.next(titles);
    this.titlesCount.next(response.meta.count);
    if (response.meta.count < this.limit*(this.currentPage.getValue() - 1 )) {
      this.currentPage.next(1);
    }
  }

  fetch(fields: Field[], page: number): void {
    let options = new RequestOptions({ headers: this.headers });
    this.http.post(this.heroesUrl, this.getQuery(fields, page), options).toPromise()
      .then(response => this.next(response.json()))
      .catch(this.handleError);
  }

  getQuery(fields: Field[], page: number): any {
    let limit = this.limit;
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
