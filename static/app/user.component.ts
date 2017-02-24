import {Component}          from '@angular/core';
import {StateService} from "./state.service";
import {Field} from "./field";
import {BehaviorSubject} from "rxjs";
import {Http, Headers} from "@angular/http";

let userStatuses = ['Watching/Reading', 'Completed', 'On-Hold', 'Dropped', 'Plan to Watch/Read'];


@Component({
  moduleId: module.id,
  selector: 'user-select',
  template: `
    <div class="card">
      <div class="card-header">
        MAL User scores
      </div>
      <div class="card-block">
        <form>
          <div class="row"><div class="col-sm-12">
            <div *ngIf="error" class="alert alert-danger" role="alert">
              <strong>{{error}}</strong>
            </div>
          </div></div>
          <div class="form-group row">
            <div class="col-sm-8">
                <input #newName type="text" class="form-control" name="inputUser" placeholder="MAL username">
            </div>
            <div class="col-sm-4">
                <button type="submit" class="btn btn-primary" (click)="setUser(newName.value)" >Set</button>
            </div>
          </div>
          <div *ngIf="userName" class="row">
            <div class="col-sm-8">
                <button *ngIf="!loading" type="submit" class="btn btn-primary" (click)="getUserScores($event)" >Reload scores</button>
                <button *ngIf="loading" type="submit" class="btn btn-primary disabled" >Loading</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class UserSelectComponent {
  private headers = new Headers({'Content-Type': 'application/json'});
  private fields: BehaviorSubject<Field[]>;
  private query: BehaviorSubject<Field[]>;
  private allFields: Field[];
  private loading: boolean;
  private userName: string;
  private error: string;

  constructor(
    private stateService: StateService,
    private http: Http) {
    this.fields = this.stateService.fieldsTerms;
    this.query = this.stateService.queryTerms;
    this.allFields = this.stateService.allFields;
  }

  getUserScores(): void {
    this.error = '';
    this.loading = true;
    const url = '/api/get-user-scores';
    this.http.post(url, JSON.stringify({"userName": this.userName}), {headers: this.headers})
      .toPromise()
      .then(this.handleResponse.bind(this))
      .catch(this.handleError.bind(this));

  }

  setUser(userName: string): void {
    this.userName = userName;

    let score = new Field("userscore__score", "Score", "UserScore", true).withSorting().withNumFilter(0, 10, 1).withUser(this.userName);
    let status = new Field("userscore__status", "Status", "UserStatus", true).withSorting().withSelectFilter(userStatuses).withUser(this.userName);
    let date = new Field("userscore__last_update", "Date", "UserDate", true).withSorting().withDateFilter().withUser(this.userName);

    let hasFields = false;
    let toDelete: Field[] = [];
    for (let f of this.stateService.allFields) {
      if (f.userName != undefined) {
        if (userName) {
          f.userName = this.userName;

        } else {
          toDelete.push(f);
        }
        hasFields = true;
      }
    }
    if (toDelete.length) {
      for (let f of toDelete) {
        let index = this.stateService.allFields.indexOf(f);
        if (index > -1) {
          this.stateService.allFields.splice(index, 1);
        }
      }
    }

    if(!hasFields) {
      this.stateService.allFields.push(score, status, date);
    }
    this.query.next(this.stateService.allFields);
    this.fields.next(this.stateService.allFields.filter(f => f.enable));
  }

  handleResponse(response: any) {
    this.query.next(this.stateService.allFields);
    this.loading = false;
  }

  handleError(error: any): void {
    this.error = JSON.stringify(error.json()['error']['args'].join(', '));
    this.loading = false;
  }

}
