"use strict";
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
var state_service_1 = require("./state.service");
var TitleTableComponent = (function () {
    function TitleTableComponent(stateService) {
        this.stateService = stateService;
        this.intToStatus = {
            '1': 'Watching',
            '2': 'Completed',
            '3': 'On-Hold',
            '4': 'Dropped',
            '6': 'Plan',
        };
        this.titles = this.stateService.filteredTitles;
        this.fields = this.stateService.fieldsTerms;
        this.query = this.stateService.queryTerms;
    }
    TitleTableComponent.prototype.showField = function (field, value) {
        if (value == null) {
            return value;
        }
        switch (field.field) {
            case 'id':
                var id = parseInt(value, 10);
                return id > 1000000 ? id - 1000000 : id;
            case 'genres':
                return value.join(', ');
            case 'authors':
                return value.join(', ');
            case 'producers':
                return value.join(', ');
            case 'serialization':
                return value.join(', ');
            case 'aired_from':
            case 'aired_to':
                return new Date(value * 1000).toLocaleString().split(',')[0];
            case 'userscore__last_update':
                return new Date(value * 1000).toLocaleString().split(',')[0];
            case 'userscore__score':
                return value != 0 ? value : '';
            case 'userscore__status':
                return this.intToStatus[value];
        }
        return value;
    };
    TitleTableComponent.prototype.changeSorting = function (field) {
        if (field.withSort) {
            if (!field.sort) {
                field.sort = 'desc';
            }
            else {
                if (field.sort == 'desc') {
                    field.sort = 'asc';
                }
                else {
                    field.sort = null;
                }
            }
            var next = this.query.getValue();
            for (var _i = 0, next_1 = next; _i < next_1.length; _i++) {
                var f = next_1[_i];
                if (f.field != field.field) {
                    f.sort = null;
                }
                else {
                    f.sort = field.sort;
                }
            }
            this.query.next(next);
            this.fields.next(next.filter(function (f) { return f.enable; }));
        }
    };
    TitleTableComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'title-table',
            template: "\n    <table id=\"title-table\" class=\"table table-striped table-bordered table-hover\">\n      <thead>\n        <tr>\n          <td *ngFor=\"let field of fields | async\" (click)=\"changeSorting(field)\">{{field.shortName}}\n            <i *ngIf=\"field.withSort && !field.sort\" class=\"fa fa-sort\"></i>\n            <i *ngIf=\"field.withSort && field.sort == 'asc'\" class=\"fa fa-sort-asc\"></i>\n            <i *ngIf=\"field.withSort && field.sort == 'desc'\" class=\"fa fa-sort-desc\"></i>\n          </td>\n        </tr>\n      </thead>\n      <tbody>\n        <tr *ngFor=\"let title of titles | async\">\n            <td *ngFor=\"let field of fields | async\" [ngSwitch]=\"field.field\">\n                <img *ngSwitchCase=\"'image'\" [class.small-img]=\"!field.big\" [class.big-img]=\"field.big\"\n                 src=\"{{showField(field, title[field.field])}}\" />\n                <a *ngSwitchCase=\"'title'\" target=\"_blank\" href=\"{{title.getTitleUrl()}}\">\n                    {{showField(field, title[field.field])}}</a>\n                <div *ngSwitchCase=\"'related'\">\n                    <div *ngFor=\"let relType of title.getRelationsTypes()\">{{title.getRelationName(relType)}}: \n                        <a *ngFor=\"let rel of title.getRelationsByType(relType); let isLast=last\" href=\"{{rel.getRelationUrl()}}\" target=\"_blank\">{{rel.title}}{{isLast ? '' : ', '}}</a>\n                    </div>\n                </div>\n                <span *ngSwitchDefault>{{showField(field, title[field.field])}}</span>\n            </td>\n        </tr>\n      </tbody>\n    </table>\n  ",
        }), 
        __metadata('design:paramtypes', [state_service_1.StateService])
    ], TitleTableComponent);
    return TitleTableComponent;
}());
exports.TitleTableComponent = TitleTableComponent;
//# sourceMappingURL=table.component.js.map