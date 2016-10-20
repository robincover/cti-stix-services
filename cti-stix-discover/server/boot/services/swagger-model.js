'use strict';

const lodash = require('lodash');
const pluralize = require('pluralize');

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

    const nestedModels = {};

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

            const modelProperties = this.getModelProperties(findOperation, nestedModels);
            const modelOptions = this.getModelOptions(findOperation);
            const model = dataSource.createModel(tag, modelProperties, modelOptions);
            this.disableRemoteMethods(model);
            models.push(model);
          }
        }
      }
    }

    for (const nestedModelTag in nestedModels) {
      const modelProperties = nestedModels[nestedModelTag];
      const modelOptions = {
        idInjection: false
      };
      const model = dataSource.createModel(nestedModelTag, modelProperties, modelOptions);
      const modelMethods = model.sharedClass.methods();
      modelMethods.forEach(function(modelMethod) {
        model.disableRemoteMethodByName(modelMethod.name);
      });
      this.disableRemoteMethods(model);
      models.push(model);
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
   * @param {Object} nestedModels Nested Models
   * @return {Object} Properties Object
   */
  getModelProperties(operation, nestedModels) {
    const modelProperties = {};
    modelProperties.id = {
      id: true,
      generated: false,
      type: 'string'
    };

    const response = operation.successResponse['200'];
    if (response) {
      const sampleValue = response.getSampleValue();
      if (sampleValue.data) {
        if (sampleValue.data.length) {
          const resourceObject = sampleValue.data[0];
          if (resourceObject.attributes) {
            for (const key in resourceObject.attributes) {
              const attribute = resourceObject.attributes[key];
              modelProperties[key] = this.getModelProperty(key, attribute, nestedModels);
            }
          }
        }
      }
    }

    return modelProperties;
  }

  /**
   * Get Model Property
   *
   * @param {string} attributeKey Key for Attribute
   * @param {Object} attribute Attribute Object
   * @param {Object} nestedModels Nested Models
   * @return {Object} Model Property Definition
   */
  getModelProperty(attributeKey, attribute, nestedModels) {
    let modelProperty;

    if (lodash.isArray(attribute)) {
      if (attribute.length) {
        const firstItem = attribute[0];
        const firstItemType = this.getAttributeType(firstItem);

        let itemPropertyType = String;

        if (firstItemType === 'object') {
          itemPropertyType = {};

          for (const itemAttributeKey in firstItem) {
            itemPropertyType[itemAttributeKey] = String;
          }

          const modelPropertyItemType = this.getModelPropertyItemType(attributeKey);
          nestedModels[modelPropertyItemType] = Object.assign({}, itemPropertyType);
          itemPropertyType.type = modelPropertyItemType;
        }

        modelProperty = [itemPropertyType];
      } else {
        modelProperty = [String];
      }
    } else {
      const attributeType = this.getAttributeType(attribute);
      modelProperty = {
        type: attributeType
      };
    }

    return modelProperty;
  }

  /**
   * Get Model Property Item Type
   *
   * @param {string} attributeKey Attribute Key
   * @return Item Type normalized
   */
  getModelPropertyItemType(attributeKey) {
    const camelized = lodash.camelCase(attributeKey);
    const capitalized = lodash.upperFirst(camelized);
    const modelPropertyItemType = pluralize(capitalized, 1);
    return modelPropertyItemType;
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
      idInjection: false,
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
