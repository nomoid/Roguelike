export class DisplaySymbol{
  constructor(chr, fg, bg){
    this.chr = character || #' ';
    this.fg = fg || '#fff';
    this.bg = bg || '#000';
  }

  render(display, x, y){
    display.draw(x, y, this.chr, this.fg, this.bg);
  }
}
