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
var field_1 = require("./field");
var http_1 = require("@angular/http");
var userStatuses = ['Watching/Reading', 'Completed', 'On-Hold', 'Dropped', 'Plan to Watch/Read'];
var UserSelectComponent = (function () {
    function UserSelectComponent(stateService, http) {
        this.stateService = stateService;
        this.http = http;
        this.headers = new http_1.Headers({ 'Content-Type': 'application/json' });
        this.fields = this.stateService.fieldsTerms;
        this.query = this.stateService.queryTerms;
        this.allFields = this.stateService.allFields;
    }
    UserSelectComponent.prototype.getUserScores = function () {
        this.error = '';
        this.loading = true;
        var url = '/api/get-user-scores';
        this.http.post(url, JSON.stringify({ "userName": this.userName }), { headers: this.headers })
            .toPromise()
            .then(this.handleResponse.bind(this))
            .catch(this.handleError.bind(this));
    };
    UserSelectComponent.prototype.setUser = function (userName) {
        this.userName = userName;
        var score = new field_1.Field("userscore__score", "Score", "UserScore", true).withSorting().withNumFilter(0, 10, 1).withUser(this.userName);
        var status = new field_1.Field("userscore__status", "Status", "UserStatus", true).withSorting().withSelectFilter(userStatuses).withUser(this.userName);
        var date = new field_1.Field("userscore__last_update", "Date", "UserDate", true).withSorting().withDateFilter().withUser(this.userName);
        var hasFields = false;
        for (var _i = 0, _a = this.stateService.allFields; _i < _a.length; _i++) {
            var f = _a[_i];
            if (f.userName && (f.userName != this.userName || f.userName == this.userName)) {
                f.userName = this.userName;
                hasFields = true;
            }
        }
        if (!hasFields) {
            this.stateService.allFields.push(score, status, date);
        }
        this.query.next(this.stateService.allFields);
        this.fields.next(this.stateService.allFields.filter(function (f) { return f.enable; }));
    };
    UserSelectComponent.prototype.handleResponse = function (response) {
        this.query.next(this.stateService.allFields);
        this.loading = false;
    };
    UserSelectComponent.prototype.handleError = function (error) {
        this.error = JSON.stringify(error.json()['error']['args'].join(', '));
        this.loading = false;
    };
    UserSelectComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'user-select',
            template: "\n    <div class=\"card\">\n      <div class=\"card-header\">\n        MAL User scores\n      </div>\n      <div class=\"card-block\">\n        <form>\n          <div class=\"row\"><div class=\"col-sm-12\">\n            <div *ngIf=\"error\" class=\"alert alert-danger\" role=\"alert\">\n              <strong>{{error}}</strong>\n            </div>\n          </div></div>\n          <div class=\"form-group row\">\n            <div class=\"col-sm-8\">\n                <input #newName type=\"text\" class=\"form-control\" name=\"inputUser\" placeholder=\"MAL username\">\n            </div>\n            <div class=\"col-sm-4\">\n                <button type=\"submit\" class=\"btn btn-primary\" (click)=\"setUser(newName.value)\" >Set</button>\n            </div>\n          </div>\n          <div *ngIf=\"userName\" class=\"row\">\n            <div class=\"col-sm-8\">\n                <button *ngIf=\"!loading\" type=\"submit\" class=\"btn btn-primary\" (click)=\"getUserScores($event)\" >Reload scores</button>\n                <button *ngIf=\"loading\" type=\"submit\" class=\"btn btn-primary disabled\" >Loading</button>\n            </div>\n          </div>\n        </form>\n      </div>\n    </div>\n  ",
        }), 
        __metadata('design:paramtypes', [state_service_1.StateService, http_1.Http])
    ], UserSelectComponent);
    return UserSelectComponent;
}());
exports.UserSelectComponent = UserSelectComponent;
//# sourceMappingURL=user.component.js.map