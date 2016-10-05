'use strict';

/**
 * Loopback Schema Service for reading JSON Schemas and registering Loopback Models
 *
 */
module.exports = class LoopbackSchemaService {
  /**
   * Load required modules and set default directories
   *
   */
  constructor() {
    const JsonSchemaService = require('./json-schema');
    const schemaBaseDirectory = `${__dirname}/schemas/stix`;
    this.jsonSchemaService = new JsonSchemaService(schemaBaseDirectory);

    const LoopbackModelService = require('./loopback-model');
    this.loopbackModelService = new LoopbackModelService();
  }

  /**
   * Load Models and attach to Server Data Source when found
   *
   * @param {Object} server Loopback Application
   * @return {undefined}
   */
  loadModels(server) {
    const modelDataSource = this.getModelDataSource(server);

    if (modelDataSource) {
      const loopbackModelService = this.loopbackModelService;
      const disableRemoteMethods = this.disableRemoteMethods;
      const afterJsonApiSerializeHandler = this.afterJsonApiSerializeHandler.bind(this);
      const beforeJsonApiSerializeHandler = this.beforeJsonApiSerializeHandler.bind(this);

      const schemaPromise = this.jsonSchemaService.getSchema();
      schemaPromise.then(function(schema) {
        for (const definitionKey in schema.definitions) {
          const definition = schema.definitions[definitionKey];
          const objectDefinition = loopbackModelService.getObjectDefinition(definition);
          const model = loopbackModelService.getModel(objectDefinition, definitionKey);
          const publicModel = loopbackModelService.isPublicModel(objectDefinition);

          if (publicModel) {
            console.log(`Registering Model [${model.modelName}] Path [${model.settings.http.path}]`);
            disableRemoteMethods(model);
            model.afterJsonApiSerialize = afterJsonApiSerializeHandler;
            model.beforeJsonApiSerialize = beforeJsonApiSerializeHandler;
          } else {
            console.log(`Registering Model [${model.modelName}]`);
          }

          const modelOptions = {
            dataSource: modelDataSource,
            public: publicModel
          };
          server.model(model, modelOptions);
        }
      });
    } else {
      console.error('Loopback Data Source with Connector not found');
    }
  }

  /**
   * Disable Remote Methods not defined in jsonapi.org specification
   *
   * @param {Object} model Loopback Model
   */
  disableRemoteMethods(model) {
    model.disableRemoteMethodByName('createChangeStream', true);
    model.disableRemoteMethodByName('count', true);
    model.disableRemoteMethodByName('exists', true);
    model.disableRemoteMethodByName('findOne', true);
    model.disableRemoteMethodByName('replaceOrCreate', true);
    model.disableRemoteMethodByName('replaceById', true);
    model.disableRemoteMethodByName('patchOrCreate', true);
    model.disableRemoteMethodByName('upsertWithWhere', true);
    model.disableRemoteMethodByName('updateAll', true);
  }

  /**
   * Before JSON API Serialize Handler converts links to dasherized names
   *
   * @param {Object} options Options
   * @param {function} callback Callback function
   * @return {undefined}
   */
  beforeJsonApiSerializeHandler(options, callback) {
    if (options.results.id) {
      options.dataLinks.self = `${options.topLevelLinks.self}/${options.results.id}`;
    }

    callback(undefined, options);
  }

  /**
   * After JSON API Serialize Handler converts model names to dasherized names
   *
   * @param {Object} options Options
   * @param {function} callback Callback function
   * @return {undefined}
   */
  afterJsonApiSerializeHandler(options, callback) {
    const dasherize = require('dasherize');

    if (Array.isArray(options.results.data)) {
      options.results.data.forEach(function(resource) {
        const resourceType = resource.type;
        resource.type = dasherize(resourceType);
        for (const key in resource.links) {
          const link = resource.links[key];
          resource.links[key] = link.replace(resourceType, resource.type);
        }
      });
    } else {
      const modelName = options.results.data.type;
      const typeName = dasherize(modelName);
      options.results.data.type = typeName;
    }

    callback(undefined, options);
  }

  /**
   * Get Model Data Source from registered Data Sources
   *
   * @param {Object} server Loopback Application
   * @return {Object} Loopback Data Source for Models
   */
  getModelDataSource(server) {
    let modelDataSource;
    if (server.dataSources) {

      for (const dataSourceName in server.dataSources) {
        let dataSource = server.dataSources[dataSourceName];
        if (dataSource.connector) {
          modelDataSource = dataSource;
          console.log(`Model Data Source Found [${dataSourceName}]`);
          break;
        }
      }
    } else {
      console.error('Loopback Data Sources not found');
    }

    return modelDataSource;
  }
};
