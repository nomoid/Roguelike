export class DisplaySymbol{
  constructor(character, fg, bg){
    this.character = character;
    this.fg = fg;
    this.bg = bg;
  }

  render(display, x, y){
    display.draw(x, y, this.character, this.fg, this.bg);
  }
}
