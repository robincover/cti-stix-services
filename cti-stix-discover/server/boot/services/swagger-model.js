'use strict';

const lodash = require('lodash');

/**
 * Swagger Model Service creates Loopback Models based on Swagger Specification
 *
 */
module.exports = class SwaggerModelService {
  /**
   * Default Constructor
   *
   */
  constructor() {
    this.datePattern = new RegExp(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
  }

  /**
   * Get Models
   *
   * @param {Object} dataSource Loopback Data Source connected using loopback-connector-swagger
   * @return {Array} Array of Loopback Models
   */
  getModels(dataSource) {
    const models = [];

    if (dataSource.connected) {
      const swaggerClient = this.getSwaggerClient(dataSource);
      for (const tag in swaggerClient.apis) {
        const swaggerApi = swaggerClient.apis[tag];
        if (swaggerApi.apis) {
          const findOperationId = this.getFindOperationId(tag);
          const findOperation = swaggerApi.apis[findOperationId];

          if (findOperation) {
            const findOperationPath = findOperation.path;
            console.log(`Located Find Operation [${findOperationId}] with Path [${findOperationPath}]`);

            const modelProperties = this.getModelProperties(findOperation);
            const modelOptions = this.getModelOptions(findOperation);
            const model = dataSource.createModel(tag, modelProperties, modelOptions);
            this.disableRemoteMethods(model);
            models.push(model);
          }
        }
      }
    }

    return models;
  }

  /**
   * Get Swagger Client from Data Source
   *
   * @param {Object} dataSource Data Source
   * @return {Object} Swagger Client
   */
  getSwaggerClient(dataSource) {
    return dataSource.connector.client;
  }

  /**
   * Get Model Properties for specified operation
   *
   * @param {Object} operation Operation Object
   * @return {Object} Properties Object
   */
  getModelProperties(operation) {
    const modelProperties = {};

    const response = operation.successResponse['200'];
    if (response) {
      const sampleValue = response.getSampleValue();
      if (sampleValue.data) {
        if (sampleValue.data.length) {
          const resourceObject = sampleValue.data[0];
          if (resourceObject.attributes) {
            for (const key in resourceObject.attributes) {
              const attribute = resourceObject.attributes[key];
              const attributeType = this.getAttributeType(attribute);

              modelProperties[key] = {
                type: attributeType
              };
            }
          }
        }
      }
    }

    return modelProperties;
  }

  /**
   * Get Attribute Type
   *
   * @param {Object} attribute Attribute
   * @return {string} Attribute Type
   */
  getAttributeType(attribute) {
    let attributeType = 'string';

    if (lodash.isArray(attribute)) {
      attributeType = 'array';
    } else if (lodash.isBoolean(attribute)) {
      attributeType = 'boolean';
    } else if (lodash.isPlainObject(attribute)) {
      attributeType = 'object';
    } else if (lodash.isNumber(attribute)) {
      attributeType = 'number';
    } else {
      const dateMatcher = this.datePattern.exec(attribute);
      if (dateMatcher) {
        attributeType = 'date';
      }
    }

    return attributeType;
  }

  /**
   * Get Model Options based on Find Operation
   *
   * @param {Object} findOperation Find Operation specification
   * @return {Object} Model Options
   */
  getModelOptions(findOperation) {
    const modelOptions = {
      http: {
        path: findOperation.path
      }
    };
    return modelOptions;
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
   * Disable Remote Methods not defined in jsonapi.org specification
   *
   * @param {Object} model Loopback Model
   * @return {undefined}
   */
  disableRemoteMethods(model) {
    model.disableRemoteMethodByName('create');
    model.disableRemoteMethodByName('createChangeStream');
    model.disableRemoteMethodByName('count');
    model.disableRemoteMethodByName('deleteById');
    model.disableRemoteMethodByName('exists');
    model.disableRemoteMethodByName('findOne');
    model.disableRemoteMethodByName('replaceOrCreate');
    model.disableRemoteMethodByName('replaceById');
    model.disableRemoteMethodByName('prototype.patchAttributes');
    model.disableRemoteMethodByName('patchOrCreate');
    model.disableRemoteMethodByName('upsertWithWhere');
    model.disableRemoteMethodByName('updateAll');
  }
};
