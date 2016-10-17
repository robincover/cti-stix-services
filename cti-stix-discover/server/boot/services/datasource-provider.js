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
    this.connectDelay = 10000;
  }

  /**
   * Get Data Source once connected
   *
   * @return {Object} Promise object returning connected Data Source when completed
   */
  getDataSource() {
    const server = this.server;
    const self = this;

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
        self.setDataSourceEvents(dataSource, dataSourceName, resolve);
      } else {
        reject();
      }
    });
  }

  /**
   * Set Data Source Events
   *
   * @param {Object} dataSource Loopback Data Source
   * @param {string} dataSourceName Data Source Name
   * @param {function} resolve Promise resolve function
   * @return {undefined}
   */
  setDataSourceEvents(dataSource, dataSourceName, resolve) {
    dataSource.once('connected', function() {
      const dataSourceConfiguration = {
        dataSource: dataSource,
        dataSourceName: dataSourceName
      };
      resolve(dataSourceConfiguration);
    });

    const connectDelay = this.connectDelay;
    const connectScope = {
      dataSource: dataSource,
      dataSourceName: dataSourceName
    };
    const connectDataSource = this.connectDataSource.bind(connectScope);
    dataSource.on('error', function() {
      console.error(`Data Source Connection Failed [${dataSourceName}]: Retrying after delay ${connectDelay}ms`);
      setTimeout(connectDataSource, connectDelay);
    });
  }

  /**
   * Connect Data Source
   *
   */
  connectDataSource() {
    const dataSourceName = this.dataSourceName;
    console.log(`Connecting to Data Source [${dataSourceName}]`);

    const dataSource = this.dataSource;
    dataSource.connector.spec = dataSource.connector.settings.spec;
    this.dataSource.connect(function(error) {
      if (error) {
        console.error(`Data Source Connection Failed [${dataSourceName}]: ${error}`);
      }
    });
  }
};
