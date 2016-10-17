'use strict';

const lodash = require('lodash');

/**
 * Swagger Model Provider implements remote methods for Loopback Models using Swagger
 *
 */
module.exports = class SwaggerModelProvider {
  /**
   * Default Constructor
   *
   */
  constructor() {
    this.findRelationshipsOperationId = 'Relationship_find';
    const SwaggerModelService = require('./swagger-model');
    this.swaggerModelService = new SwaggerModelService();
  }

  /**
   * Setup Models
   *
   * @param {Object} dataSource Loopback Data Source connected using loopback-connector-swagger
   * @return {Array} Array of Loopback Models
   */
  getModels(dataSource) {
    const models = this.swaggerModelService.getModels(dataSource);
    models.forEach(function(model) {
      this.setupMethods(model);
    }, this);
    return models;
  }

  /**
   * Get Find Operation Identifier
   *
   * @param {string} tag Swagger tag
   * @param {string} Identifier for Find Operation
   */
  getFindOperationId(tag) {
    return `${tag}_find`;
  }

  /**
   * Get Find By Identifier Operation Identifier
   *
   * @param {string} tag Swagger tag
   * @param {string} Identifier for Find Operation
   */
  getFindByIdOperationId(tag) {
    return `${tag}_findById`;
  }

  /**
   * Setup Methods
   *
   * @param {Object} model Loopback Model
   * @return {undefined}
   */
  setupMethods(model) {
    this.setupMethod(model, 'find');
    this.setupMethod(model, 'findById');
  }

  /**
   * Setup Method on Model
   *
   * @param {Object} model Loopback Model
   * @param {string} methodName Method Name
   * @return {undefined}
   */
  setupMethod(model, methodName) {
    const operationId = `${model.modelName}_${methodName}`;

    const dataAccessObject = model.dataSource.DataAccessObject;
    const accessMethod = dataAccessObject[operationId];
    if (accessMethod) {
      const context = {
        model: model,
        accessMethod: accessMethod,
        service: this
      };
      model[methodName] = this[methodName].bind(context);
    } else {
      console.error(`Data Access Object method [${operationId}] not found`);
    }
  }

  /**
   * Find function implementing invocation of Swagger Client Methods
   *
   * @param {Object} filter Filter Object
   * @param {function} callback Callback function
   * @return {undefined}
   */
  find(filter, callback) {
    const parameters = {
      filter: JSON.stringify(filter)
    };

    this.accessMethod(parameters, function(error, result) {
      let object = undefined;
      if (result) {
        object = result.obj;
      }
      callback(error, object);
    });
  }

  /**
   * Find By Identifier function implementing invocation of Swagger Client Methods
   *
   * @param {string} id Identifier
   * @param {Object} filter Filter Object
   * @param {function} callback Callback function
   * @return {undefined}
   */
  findById(id, filter, callback) {
    const model = this.model;
    const parameters = {
      id: id,
      filter: JSON.stringify(filter)
    };

    const self = this.service;

    this.accessMethod(parameters, function(error, result) {
      let object = undefined;
      if (result) {
        object = result.obj;
      }

      if (object) {
        const relationshipsPromise = self.findRelationships(id, model);
        relationshipsPromise.catch(function(relationshipsError) {
          callback(relationshipsError, undefined);
        });
        relationshipsPromise.then(function(result) {
          let foundObject = result.obj;
          self.setRelationships(object, foundObject);
          const referencedIds = self.getReferencedIds(object);
          const referencedObjectsPromise = self.findReferencedObjects(referencedIds, model);

          referencedObjectsPromise.catch(function(referencedObjectsError) {
            callback(referencedObjectsError, undefined);
          });
          referencedObjectsPromise.then(function(results) {
            const referencedObjects = results.map(function(result) {
              return result.obj.data;
            });
            const foundReferencedObjects = {
              data: referencedObjects
            };
            self.setRelationships(object, foundReferencedObjects);
            callback(undefined, object);
          });
        });
      } else {
        callback(error, object);
      }
    });
  }

  /**
   * Find Relationships
   *
   * @param {string} id Object Identifier
   * @param {Object} model Loopback Model
   * @return Promise resolving to Object containing Search Results Object
   */
  findRelationships(id, model) {
    const filter = this.getFindRelationshipsFilter(id);
    const dataAccessObject = model.dataSource.DataAccessObject;
    const findRelationshipsMethod = dataAccessObject[this.findRelationshipsOperationId];

    return new Promise(function(resolve, reject) {
      if (findRelationshipsMethod) {
        const parameters = {
          filter: JSON.stringify(filter)
        };
        findRelationshipsMethod(parameters, function(error, result) {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      } else {
        const error = {
          message: 'Find Relationships method not found'
        };
        reject(error);
      }
    });
  }

  /**
   * Find Referenced Objects
   *
   * @param {Array} Referenced Object Identifiers
   * @param {Object} model Loopback Model
   * @return {Object} Promise object resolving to array of search results
   */
  findReferencedObjects(referencedIds, model) {
    const dataAccessObject = model.dataSource.DataAccessObject;

    const promises = [];
    referencedIds.forEach(function(referencedId) {
      const referencedType = this.getReferencedType(referencedId);
      const camelizedReferencedType = lodash.camelCase(referencedType);
      const referencedModelName = lodash.upperFirst(camelizedReferencedType);
      const findByIdOperationId = this.getFindByIdOperationId(referencedModelName);
      const findByIdMethod = dataAccessObject[findByIdOperationId];

      if (findByIdMethod) {
        const promise = new Promise(function(resolve, reject) {
          const parameters = {
            id: referencedId
          };
          findByIdMethod(parameters, function(error, result) {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });
        promises.push(promise);
      }
    }, this);

    return Promise.all(promises);
  }

  /**
   * Get Referenced Identifiers
   *
   * @param {Object} resourceObject Resource Object
   * @return {Array} Array of Referenced Identifiers from included Relationship Objects
   */
  getReferencedIds(resourceObject) {
    const id = resourceObject.data.id;

    const referencedIds = [];
    resourceObject.included.forEach(function(includedObject) {
      if (includedObject.attributes.source_ref) {
        referencedIds.push(includedObject.attributes.source_ref);
      }
      if (includedObject.attributes.target_ref) {
        referencedIds.push(includedObject.attributes.target_ref);
      }
    });

    const foreignReferencedIds = referencedIds.filter(function(referencedId) {
      return referencedId !== id;
    });
    return foreignReferencedIds;
  }

  /**
   * Get Referenced Type
   *
   * @param {string} referencedId Referenced Identifier
   * @return Referenced Type
   */
  getReferencedType(referencedId) {
    return referencedId.split('--')[0];
  }

  /**
   * Get Find Relationships Filter for Source and Target References
   *
   * @param {string} id Object Identifier
   * @return {Object} Relationships Filter Object
   */
  getFindRelationshipsFilter(id) {
    return {
      where: {
        or: [
          {
            source_ref: id
          }, {
            target_ref: id
          }
        ]
      }
    };
  }

  /**
   * Set Relationships on Object
   *
   * @param {Object} resourceObject Resource Object
   * @param {Object} foundResourceObject Resource Object found based on Relationships
   * @return {undefined}
   */
  setRelationships(resourceObject, foundResourceObject) {
    if (resourceObject.included === undefined) {
      resourceObject.included = [];
    }

    if (resourceObject.data.relationships === undefined) {
      resourceObject.data.relationships = {};
    }

    const relationshipResourceObjects = foundResourceObject.data;
    resourceObject.included = resourceObject.included.concat(relationshipResourceObjects);

    const snakeCase = require('snake-case');
    relationshipResourceObjects.forEach(function(relationshipResourceObject) {
      const resourceIdentifierObject = this.getResourceIdentifierObject(relationshipResourceObject);
      const objectType = resourceIdentifierObject.type;
      const objectTypeProperty = snakeCase(objectType);

      if (resourceObject.data.relationships[objectTypeProperty] === undefined) {
        resourceObject.data.relationships[objectTypeProperty] = {
          data: []
        };
      }

      resourceObject.data.relationships[objectTypeProperty].data.push(resourceIdentifierObject);
    }, this);
  }

  /**
   * Get Resource Identifier Object
   *
   * @param {Object} resourceObject Resource Object
   * @return {Object} Resource Identifier Object
   */
  getResourceIdentifierObject(resourceObject) {
    const resourceIdentifierObject = {
      type: resourceObject.type,
      id: resourceObject.id
    };
    return resourceIdentifierObject;
  }
};
