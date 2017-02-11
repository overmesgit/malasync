let relationRename = {
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

export class Related {

  i: number;
  t: string;
  title: string;
  r: string;

  getRelationUrl(): string {
    let id = this.i;
    if (this.i > 1000000) {
      id -= 1000000;
      return `https://myanimelist.net/manga/${id}`
    } else {
      return `https://myanimelist.net/anime/${id}`
    }
  }
}

export class Title {
  id: number;
  title: string;
  members_score: number;
  last_update: string;
  aired_from: string;
  aired_to: string;
  duration: number;
  english: string;
  episodes: number;
  favorites: number;
  genres: string[];
  image: string;
  japanese: string;
  members: number;
  producers: string[];
  rating: number;
  related: Related[];
  scores: number;
  status: string;
  synopsis: string;
  type: string;


  static fromJson(data: any): Title[] {
    let titles: Title[] = [];
    for (let row of data) {
        let title = new Title();
        for (let prop in row) title[prop] = row[prop];
        if (title.related) {
          let related: Related[] = [];
          for (let rel of title.related) {
            let r = new Related();
            for (let prop in rel) r[prop] = rel[prop];
            related.push(r);
          }
          title.related = related;
        }
        titles.push(title);
    }
    return titles;
  }

  getTitleUrl() {
    let id = this.id;
    if (this.id > 1000000) {
      id -= 1000000;
      return `https://myanimelist.net/manga/${id}`
    } else {
      return `https://myanimelist.net/anime/${id}`
    }
  }

  getRelationsTypes(): string[] {
    if (!this.related) return [];
    let types = {};
    for(let r of this.related){
      types[r.r] = true;
    }
    return Object.keys(types);
  }

  getRelationsByType(relType: string): Related[] {
    let res: Related[] = [];
    for(let r of this.related) {
      if (r['r'] == relType) {
        res.push(r)
      }
    }
    return res;
  }

  getRelationName(relType: string): string {
    return relationRename[relType];
  }
}
