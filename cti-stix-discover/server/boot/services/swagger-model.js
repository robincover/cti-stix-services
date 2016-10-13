'use strict';

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

            const modelProperties = {};
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
