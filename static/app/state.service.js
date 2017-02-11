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
var http_1 = require('@angular/http');
var title_1 = require("./title");
var field_1 = require("./field");
var Subject_1 = require("rxjs/Subject");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var Observable_1 = require("rxjs/Observable");
var typeValues = ["TV", "Movie", "OVA", "Special",
    "ONA", "Music", "Doujinshi",
    "Manhwa", "Manhua", "Novel",
    "One-shot", "Manga"
];
var genres = ['Action', 'Adventure', 'Cars', 'Comedy', 'Dementia', 'Demons', 'Doujinshi', 'Drama',
    'Ecchi', 'Fantasy', 'Game', 'Gender Bender', 'Harem', 'Hentai', 'Historical', 'Horror', 'Josei', 'Kids',
    'Magic', 'Martial Arts', 'Mecha', 'Military', 'Music', 'Mystery', 'Parody', 'Police', 'Psychological',
    'Romance', 'Samurai', 'School', 'Sci-Fi', 'Seinen', 'Shoujo', 'Shoujo Ai', 'Shounen', 'Shounen Ai',
    'Slice of Life', 'Space', 'Sports', 'Super Power', 'Supernatural', 'Thriller', 'Vampire', 'Yaoi', 'Yuri'
];
var statuses = ["Not yet aired", "Currently Airing", "Finished Airing", "Not yet published", "Publishing", "Finished"];
var initFields = [
    new field_1.Field("image", "Image", "Image", true),
    new field_1.Field("type", "Type", "Type", true).withSelectFilter(typeValues),
    new field_1.Field("title", "Title", "Title", true),
    new field_1.Field("members_score", "Score", "Score", true).withSorting('desc').withNumFilter(1, 10, 0.1, [1, 10]),
    new field_1.Field("aired_from", "Aired From", "From", true).withSorting().withDateFilter(),
    new field_1.Field("aired_to", "Aired To", "To", true).withSorting().withDateFilter(),
    new field_1.Field("english", "English", "English", false),
    new field_1.Field("synopsis", "Synopsis", "Synopsis", false),
    new field_1.Field("status", "Status", "Status", true).withSelectFilter(statuses),
    new field_1.Field("genres", "Genres", "Genres", true).withSelectFilter(genres),
    new field_1.Field("related", "Related", "Related", false),
    new field_1.Field("scores", "Scores Count", "Scores", false).withSorting().withNumFilter(1, 800000, 1, [1000, 800000]),
    new field_1.Field("members", "Members", "Members", false).withSorting().withNumFilter(1, 500000, 1),
    new field_1.Field("favorites", "Favorites", "Fav.", false).withNumFilter(1, 100000, 1),
    new field_1.Field("japanese", "Japanese", "Japanese", false),
    new field_1.Field("producers", "Producers", "Producers", false),
    new field_1.Field("authors", "Authors", "Authors", false),
    new field_1.Field("serialization", "Serialization", "Serialization", false),
    new field_1.Field("rating", "Rating", "Rating", false),
    new field_1.Field("id", "Id", "Id", false).withSorting().withNumFilter(1, 90000, 1),
    new field_1.Field("episodes", "Episodes", "Ep.", false).withSorting().withNumFilter(1, 3000, 1),
    new field_1.Field("duration", "Duration", "Dur.", false).withSorting().withNumFilter(1, 500, 1),
    new field_1.Field("chapters", "Chapters", "Chapters", false).withSorting().withNumFilter(1, 15000, 1),
    new field_1.Field("volumes", "Volumes", "Volumes", false).withSorting().withNumFilter(1, 500, 1),
];
var StateService = (function () {
    function StateService(http) {
        var _this = this;
        this.http = http;
        this.headers = new http_1.Headers({ 'Content-Type': 'application/json' });
        this.heroesUrl = '/api/title';
        this.filteredTitles = new Subject_1.Subject();
        this.allFields = initFields;
        this.fieldsTerms = new BehaviorSubject_1.BehaviorSubject(initFields.filter(function (f) { return f.enable; }));
        this.queryTerms = new BehaviorSubject_1.BehaviorSubject(initFields);
        this.currentPage = new BehaviorSubject_1.BehaviorSubject(1);
        this.titlesCount = new BehaviorSubject_1.BehaviorSubject(1);
        this.localStorage = localStorage;
        this.limit = 100;
        if (!('version' in this.localStorage)) {
            this.localStorage['version'] = 1;
        }
        if ('page' in this.localStorage) {
            this.currentPage = new BehaviorSubject_1.BehaviorSubject(parseInt(this.localStorage['page'], 10));
        }
        if ('fields' in this.localStorage) {
            var stored = JSON.parse(this.localStorage['fields']);
            this.allFields.splice(0, this.allFields.length);
            for (var _i = 0, stored_1 = stored; _i < stored_1.length; _i++) {
                var f = stored_1[_i];
                var d = new field_1.Field('', '', '', false);
                for (var prop in f)
                    d[prop] = f[prop];
                this.allFields.push(d);
            }
            this.queryTerms.next(this.allFields);
            this.fieldsTerms.next(this.allFields.filter(function (f) { return f.enable; }));
        }
        Observable_1.Observable.combineLatest(this.queryTerms.debounceTime(300), this.currentPage, function (v1, v2) { return [v1, v2]; })
            .distinctUntilChanged().subscribe(function (values) { return _this.fetch(values[0], values[1]); });
        this.currentPage.subscribe(function (value) { return _this.updatePageHistory(value); });
        this.fieldsTerms.subscribe(function (value) { return _this.updateFieldsHistory(value); });
    }
    StateService.prototype.updatePageHistory = function (page) {
        this.localStorage['page'] = page;
    };
    StateService.prototype.updateFieldsHistory = function (enabledFields) {
        this.localStorage['fields'] = JSON.stringify(this.allFields);
    };
    StateService.prototype.next = function (response) {
        var titles = title_1.Title.fromJson(response.data);
        this.filteredTitles.next(titles);
        this.titlesCount.next(response.meta.count);
        if (response.meta.count < this.limit * (this.currentPage.getValue() - 1)) {
            this.currentPage.next(1);
        }
    };
    StateService.prototype.fetch = function (fields, page) {
        var _this = this;
        var options = new http_1.RequestOptions({ headers: this.headers });
        this.http.post(this.heroesUrl, this.getQuery(fields, page), options).toPromise()
            .then(function (response) { return _this.next(response.json()); })
            .catch(this.handleError);
    };
    StateService.prototype.getQuery = function (fields, page) {
        var limit = this.limit;
        var offset = (page - 1) * limit;
        var query = { offset: offset, limit: limit };
        query['fields'] = [];
        for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
            var f = fields_1[_i];
            query['fields'].push(f.getQuery());
        }
        return query;
    };
    StateService.prototype.handleError = function (error) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    };
    StateService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], StateService);
    return StateService;
}());
exports.StateService = StateService;
//# sourceMappingURL=state.service.js.map