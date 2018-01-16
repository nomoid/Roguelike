import {DisplaySymbol} from "./display_symbol.js";
import * as E from './entity_mixins.js';

export class MixableSymbol extends DisplaySymbol{
  constructor(template){
    super(template);
    if(!this.attr){
      this.attr = {};
    }
    this.mixins = [];
    this.mixinTracker = {};

    if(template.mixinNames){
      for(let i = 0; i < template.mixinNames.length; i++){
        let name = template.mixinNames[i];
        this.mixins.push(E[name]);
        this.mixinTracker[name] = true;
      }
    }
    for(let i = 0; i < this.mixins.length; i++){
      let m = this.mixins[i];
      if(m.META.stateNamespace){
        let model = {};
        if(m.META.stateModel){
          for(let sbase in m.META.stateModel){
            //TODO implement deep copy of model
            model[sbase] = m.META.stateModel[sbase];
          }
        }
        this.attr[m.META.stateNamespace] = model;
      }

      if(m.METHODS){
        for(let method in m.METHODS){
          this[method] = m.METHODS[method];
        }
      }
    }
  }

  raiseMixinEvent(evtLabel, evtData){
    for (let i=0; i < this.mixins.length; i++){
      let m = this.mixins[i];
      if(m.LISTENERS && m.LISTENERS[evtLabel]){
        m.LISTENERS[evtLabel].call(this,evtData);
      }
    }
  }
}
