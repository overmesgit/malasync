import {Component, OnInit}          from '@angular/core';
import {TitleService} from "./title.service";
import {Title} from "./title";
@Component({
  moduleId: module.id,
  selector: 'my-app',
  template: `
    <table>
        <tr *ngFor="let title of titles">
            <td>{{title.id}}</td>
            <td>{{title.title}}</td>
            <td>{{title.members_score}}</td>
            <td>{{title.last_update}}</td>
            <td>{{title.aired_from}}</td>
            <td>{{title.aired_to}}</td>
            <td>{{title.duration}}</td>
            <td>{{title.english}}</td>
            <td>{{title.episodes}}</td>
            <td>{{title.favorites}}</td>
            <td>{{title.genres}}</td>
            <td>{{title.image}}</td>
            <td>{{title.japanese}}</td>
            <td>{{title.members}}</td>
            <td>{{title.producers}}</td>
            <td>{{title.rating}}</td>
            <td>{{title.scores}}</td>
            <td>{{title.status}}</td>
            <td>{{title.synopsis}}</td>
            <td>{{title.type}}</td>
        </tr>
    </table>
  `,
})
export class AppComponent implements OnInit{
  titles: Title[];

  constructor(
    private titleService: TitleService) { }

  getTitles(): void {
    this.titleService
        .getTitles()
        .then(titles => this.titles = titles);
  }

  ngOnInit(): void {
    this.getTitles();
  }
}
