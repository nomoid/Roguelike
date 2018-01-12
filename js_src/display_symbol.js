export class DisplaySymbol{
  constructor(data){
    this.chr = data.chr || ' ';
    this.fg = data.fg || '#fff';
    this.bg = data.bg || '#000';
  }

  render(display, x, y){
    display.draw(x, y, this.chr, this.fg, this.bg);
  }
}
