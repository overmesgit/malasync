import {Component}          from '@angular/core';
@Component({
  moduleId: module.id,
  selector: 'my-app',
  template: `
    <div class="container-fluid" style="margin: 20px">
      <div class="row">
        <div class="col-sm-2"><field-select></field-select></div>
        <div class="col-sm-10">
            <pagination></pagination>
            <div class="row">
               <title-table></title-table>
            </div>
            <pagination></pagination>
        </div>
      </div>
     </div>
  `,
})
export class AppComponent{
}
