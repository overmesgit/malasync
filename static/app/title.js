"use strict";
var relationRename = {
    "alv": "alternative version",
    "als": "alternative setting",
    "ada": "adaptation",
    "cha": "character",
    "ful": "full story",
    "oth": "other",
    "pre": "prequel",
    "par": "parent story",
    "seq": "sequel",
    "spi": "spin-off",
    "sid": "side story",
    "sum": "summary",
};
var Related = (function () {
    function Related() {
    }
    Related.prototype.getRelationUrl = function () {
        var id = this.i;
        if (this.i > 1000000) {
            id -= 1000000;
            return "https://myanimelist.net/manga/" + id;
        }
        else {
            return "https://myanimelist.net/anime/" + id;
        }
    };
    return Related;
}());
exports.Related = Related;
var Title = (function () {
    function Title() {
    }
    Title.fromJson = function (data) {
        var titles = [];
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var row = data_1[_i];
            var title = new Title();
            for (var prop in row)
                title[prop] = row[prop];
            if (title.related) {
                var related = [];
                for (var _a = 0, _b = title.related; _a < _b.length; _a++) {
                    var rel = _b[_a];
                    var r = new Related();
                    for (var prop in rel)
                        r[prop] = rel[prop];
                    related.push(r);
                }
                title.related = related;
            }
            titles.push(title);
        }
        return titles;
    };
    Title.prototype.getTitleUrl = function () {
        var id = this.id;
        if (this.id > 1000000) {
            id -= 1000000;
            return "https://myanimelist.net/manga/" + id;
        }
        else {
            return "https://myanimelist.net/anime/" + id;
        }
    };
    Title.prototype.getRelationsTypes = function () {
        if (!this.related)
            return [];
        var types = {};
        for (var _i = 0, _a = this.related; _i < _a.length; _i++) {
            var r = _a[_i];
            types[r.r] = true;
        }
        return Object.keys(types);
    };
    Title.prototype.getRelationsByType = function (relType) {
        var res = [];
        for (var _i = 0, _a = this.related; _i < _a.length; _i++) {
            var r = _a[_i];
            if (r['r'] == relType) {
                res.push(r);
            }
        }
        return res;
    };
    Title.prototype.getRelationName = function (relType) {
        return relationRename[relType];
    };
    return Title;
}());
exports.Title = Title;
//# sourceMappingURL=title.js.map