'use strict';

/**
 * Data Source Bootstrap creates models based on Data Source connected to Swagger Specification
 *
 * @module boot/datasource
 */
module.exports = function(server) {
  const DataSourceProvider = require('./services/datasource-provider');
  const dataSourceProvider = new DataSourceProvider(server);

  const SwaggerModelProvider = require('./services/swagger-model-provider');
  const swaggerModelProvider = new SwaggerModelProvider();

  const dataSourcePromise = dataSourceProvider.getDataSource();

  dataSourcePromise.then(function(dataSourceConfiguration) {
    console.log(`Data Source Connected [${dataSourceConfiguration.dataSourceName}]`);

    const models = swaggerModelProvider.getModels(dataSourceConfiguration.dataSource);

    models.forEach(function(model) {
      server.model(model);
    });
  });
  dataSourcePromise.catch(function() {
    console.error('Data Source Not Found');
  });
};
