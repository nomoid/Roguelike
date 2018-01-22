//general factory system

import {DATASTORE} from './datastore.js';

export class Factory{
  constructor(productClass, datastoreNamespace){
    this.productClass = productClass;
    this.knownTemplates = {};
    this.datastoreNamespace = datastoreNamespace;
  }

  learn(template){
    this.knownTemplates[template.templateName ? templateName :
    template.name] = template;
  }

  create(templateName, datastore){
    let product = new this.productClass(this.knownTemplates[templateName]);
    if(datastore){
      DATASTORE[this.datastoreNamespace][product.getId()] = product;
    }
    if(typeof product.setEnvironment === 'function'){
      product.setEnvironment(DATASTORE.GAME);
    }
    return product;
  }
}
