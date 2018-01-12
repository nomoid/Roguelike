import {Color} from './color.js';

export class DisplaySymbol{
  constructor(data){
    this.chr = data.chr || ' ';
    this.fg = data.fg || Color.ENTITY_FG;
    this.bg = data.bg || Color.ENTITY_BG;
  }

  render(display, x, y){
    display.draw(x, y, this.chr, this.fg, this.bg);
  }
}
