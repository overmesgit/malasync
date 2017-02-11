"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var platform_browser_1 = require('@angular/platform-browser');
var forms_1 = require('@angular/forms');
var http_1 = require("@angular/http");
var app_component_1 = require("./app.component");
var state_service_1 = require("./state.service");
var table_component_1 = require("./table.component");
var field_component_1 = require("./field.component");
require('./rxjs-extensions');
var pagination_component_1 = require("./pagination.component");
var ng2_nouislider_1 = require('ng2-nouislider');
var ng2_select_1 = require('ng2-select/ng2-select');
var user_component_1 = require("./user.component");
var filter_component_1 = require("./filter.component");
var ng2_dnd_1 = require("ng2-dnd");
var mydaterangepicker_1 = require('mydaterangepicker');
var win = (function (_super) {
    __extends(win, _super);
    function win() {
        _super.apply(this, arguments);
    }
    return win;
}(Window));
if (window.prod) {
    core_1.enableProdMode();
}
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [
                platform_browser_1.BrowserModule,
                forms_1.FormsModule,
                http_1.HttpModule,
                ng2_select_1.SelectModule,
                ng2_dnd_1.DndModule.forRoot(),
                mydaterangepicker_1.MyDateRangePickerModule
            ],
            declarations: [
                ng2_nouislider_1.NouisliderComponent,
                app_component_1.AppComponent,
                table_component_1.TitleTableComponent,
                field_component_1.FieldComponent,
                pagination_component_1.PaginationComponent,
                user_component_1.UserSelectComponent,
                filter_component_1.FilterComponent
            ],
            providers: [state_service_1.StateService],
            bootstrap: [app_component_1.AppComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map