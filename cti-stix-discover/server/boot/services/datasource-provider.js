'use strict';

/**
 * Data Source Provider for accessing connected data sources
 *
 */
module.exports = class DataSourceProvider {
  /**
   * Default Constructor
   *
   * @param {Object} server Loopback Server
   */
  constructor(server) {
    this.server = server;
  }

  /**
   * Get Data Source once connected
   *
   * @return {Object} Promise object returning connected Data Source when completed
   */
  getDataSource() {
    const server = this.server;

    return new Promise(function(resolve, reject) {
      let dataSource = undefined;
      let dataSourceName = undefined;

      for (const dataSourceKey in server.dataSources) {
        const serverDataSource = server.dataSources[dataSourceKey];
        dataSource = serverDataSource;
        dataSourceName = dataSourceKey;
        break;
      }

      if (dataSource) {
        dataSource.once('connected', function() {
          const dataSourceConfiguration = {
            dataSource: dataSource,
            dataSourceName: dataSourceName
          };
          resolve(dataSourceConfiguration);
        });
      } else {
        reject();
      }
    });
  }
};
