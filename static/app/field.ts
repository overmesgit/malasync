export class Field {
  name: string;
  enable: boolean;

  constructor(name: string, enable: boolean) {
    this.name = name;
    this.enable = enable;
  }

  display(): string {
    return this.name[0].toUpperCase() + this.name.slice(1)
  }
}
