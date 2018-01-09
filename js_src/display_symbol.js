export class DisplaySymbol{
  constructor(chr, fg, bg){
    this.chr = chr || ' ';
    this.fg = fg || '#fff';
    this.bg = bg || '#000';
  }

  render(display, x, y){
    display.draw(x, y, this.chr, this.fg, this.bg);
  }
}
