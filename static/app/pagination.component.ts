import {Component}          from '@angular/core';
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {StateService} from "./state.service";
@Component({
  moduleId: module.id,
  selector: 'pagination',
  template: `
    <nav aria-label="Page navigation">
      <ul class="pagination">
        <li *ngFor="let page of shownPage | async"  [ngClass]="{'active': page === currentPage() }"
         class="page-item" (click)="nextPage(page)"><a class="page-link" href="#">{{page}}</a></li>
      </ul>
    </nav>
  `,
})
export class PaginationComponent{
  public shownPage = new BehaviorSubject([1]);
  constructor(private stateService: StateService){
    this.stateService.titlesCount.distinctUntilChanged()
      .subscribe(titlesCount => this.update(this.stateService.currentPage.getValue(), titlesCount));
    this.stateService.currentPage.distinctUntilChanged()
      .subscribe(page => this.update(page, this.stateService.titlesCount.getValue()));
  };

  currentPage(): number {
    return this.stateService.currentPage.getValue();
  }

  nextPage(page: number): void {
    this.stateService.currentPage.next(page);
  }

  update(page: number, titles: number): void {
    let nextPages: number[] = [];
    let maxPage = titles/100 + 1;
    for (let i = page - 10; i <= page + 10; i++) {
      if (i > 0 && i <= maxPage) {
        nextPages.push(i);
      }
    }
    this.shownPage.next(nextPages);
  }

}
