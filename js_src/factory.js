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

  create(templateName){
    let product = new this.productClass(this.knownTemplates[templateName]);
    DATASTORE[this.datastoreNamespace][product.getId()] = product;
    return product;
  }
}
