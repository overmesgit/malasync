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
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var state_service_1 = require("./state.service");
var PaginationComponent = (function () {
    function PaginationComponent(stateService) {
        var _this = this;
        this.stateService = stateService;
        this.shownPage = new BehaviorSubject_1.BehaviorSubject([1]);
        this.stateService.titlesCount.distinctUntilChanged()
            .subscribe(function (titlesCount) { return _this.update(_this.stateService.currentPage.getValue(), titlesCount); });
        this.stateService.currentPage.distinctUntilChanged()
            .subscribe(function (page) { return _this.update(page, _this.stateService.titlesCount.getValue()); });
    }
    ;
    PaginationComponent.prototype.currentPage = function () {
        return this.stateService.currentPage.getValue();
    };
    PaginationComponent.prototype.nextPage = function (page) {
        this.stateService.currentPage.next(page);
    };
    PaginationComponent.prototype.update = function (page, titles) {
        var nextPages = [];
        var maxPage = titles / 100 + 1;
        for (var i = page - 10; i <= page + 10; i++) {
            if (i > 0 && i <= maxPage) {
                nextPages.push(i);
            }
        }
        this.shownPage.next(nextPages);
    };
    PaginationComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'pagination',
            template: "\n    <nav aria-label=\"Page navigation\">\n      <ul class=\"pagination\">\n        <li *ngFor=\"let page of shownPage | async\"  [ngClass]=\"{'active': page === currentPage() }\"\n         class=\"page-item\" (click)=\"nextPage(page)\"><a class=\"page-link\" href=\"#\">{{page}}</a></li>\n      </ul>\n    </nav>\n  ",
        }), 
        __metadata('design:paramtypes', [state_service_1.StateService])
    ], PaginationComponent);
    return PaginationComponent;
}());
exports.PaginationComponent = PaginationComponent;
//# sourceMappingURL=pagination.component.js.map