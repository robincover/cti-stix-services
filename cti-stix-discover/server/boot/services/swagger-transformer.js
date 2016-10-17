'use strict';

const dasherize = require('dasherize');
const pluralize = require('pluralize');

/**
 * Swagger Transformer Service for transforming Swagger Specification to follow JSON API Specification
 *
 */
module.exports = class SwaggerTransformerService {
  /**
   * Default Constructor
   *
   */
  constructor() {
    this.reservedProperties = [
      'id',
      'type'
    ];
  }

  /**
   * Get Swagger Specification transformed to follow JSON API Specification
   *
   * @param {Object} swagger Swagger Specification
   * @return {Object} Transformed Swagger Specification
   */
  getSpecification(swagger) {
    const specification = Object.assign({}, swagger);

    this.processDefinitions(specification);
    this.processPaths(specification);

    return specification;
  }

  /**
   * Process Definitions and update Schema References
   *
   * @param {Object} specification Swagger Specification
   * @return {Object} Updated Swagger Specification
   */
  processDefinitions(specification) {
    for (const key in specification.definitions) {
      const definition = specification.definitions[key];

      if (definition.properties.id) {
        const attributesKey = this.getAttributesKey(key);
        specification.definitions[attributesKey] = this.getAttributesDefinition(definition);

        const resourceObjectKey = this.getResourceObjectKey(key);
        specification.definitions[resourceObjectKey] = this.getResourceObjectDefinition(key);

        const resourceKey = this.getResourceKey(key);
        specification.definitions[resourceKey] = this.getResourceDefinition(key);

        const resourcesKey = this.getResourcesKey(key);
        specification.definitions[resourcesKey] = this.getResourcesDefinition(key);

        delete specification.definitions[key];
      }
    }

    specification.definitions['ErrorObject'] = this.getErrorObjectDefinition();

    const errorObjectsKey = this.getErrorObjectsKey();
    specification.definitions[errorObjectsKey] = this.getErrorObjectsDefinition();

    return specification;
  }

  /**
   * Process Paths and update Schema References
   *
   * @param {Object} specification Swagger Specification
   * @return {Object} Updated Swagger Specification
   */
  processPaths(specification) {
    const errorObjectsKey = this.getErrorObjectsKey();
    const notFoundResponse = {
      description: 'Resource not found',
      schema: {
        $ref: this.getDefinitionRef(errorObjectsKey)
      }
    };
    const unprocessableEntityResponse = {
      description: 'Resource cannot be processed',
      schema: {
        $ref: this.getDefinitionRef(errorObjectsKey)
      }
    };
    const badRequestResponse = {
      description: 'Resource malformed',
      schema: {
        $ref: this.getDefinitionRef(errorObjectsKey)
      }
    };

    for (const pathKey in specification.paths) {
      const path = specification.paths[pathKey];
      for (const methodKey in path) {
        const method = path[methodKey];
        const operationId = method.operationId;
        if (operationId.endsWith('create')) {
          method.parameters[0].schema.$ref = this.getResourceKey(method.parameters[0].schema.$ref);

          method.responses['201'] = method.responses['200'];
          method.responses['201'].schema.$ref = this.getResourceKey(method.responses['201'].schema.$ref);
          delete method.responses['200'];

          method.responses['400'] = badRequestResponse;
          method.responses['422'] = unprocessableEntityResponse;
        } else if (operationId.endsWith('find')) {
          method.responses['200'].schema = {
            $ref: this.getResourcesKey(method.responses['200'].schema.items.$ref)
          };
        } else if (operationId.endsWith('findById')) {
          method.responses['200'].schema.$ref = this.getResourceKey(method.responses['200'].schema.$ref);
          method.responses['404'] = notFoundResponse;
        } else if (operationId.endsWith('deleteById')) {
          delete method.responses['200'];
          method.responses['204'] = {
            description: 'Deleted Completed'
          };
        } else if (operationId.endsWith('patchAttributes')) {
          method.parameters[0].schema.$ref = this.getResourceKey(method.parameters[0].schema.$ref);
          method.responses['200'].schema.$ref = this.getResourceKey(method.responses['200'].schema.$ref);

          method.responses['400'] = badRequestResponse;
          method.responses['404'] = notFoundResponse;
          method.responses['422'] = unprocessableEntityResponse;
        }
      }
    }

    return specification;
  }

  /**
   * Get Attributes Definition for specified Object key
   *
   * @param {Object} definition Object Definition
   * @return {Object} Attributes Definition
   */
  getAttributesDefinition(definition) {
    const attributes = Object.assign({}, definition);
    this.deleteReservedProperties(attributes);
    return attributes;
  }

  /**
   * Get Resource Object Definition for specified Object key
   *
   * @param {string} key Object Key
   * @return {Object} Resource Object Definition
   */
  getResourceObjectDefinition(key) {
    const type = this.getType(key);
    const attributesKey = this.getAttributesKey(key);

    const definition = {
      type: 'object',
      properties: {
        id: {
          type: 'string'
        },
        type: {
          type: 'string',
          enum: [
            type
          ]
        },
        attributes: {
          $ref: this.getDefinitionRef(attributesKey)
        }
      }
    };

    return definition;
  }

  /**
   * Get Resource Definition for specified Object key
   *
   * @param {string} key Object Key
   * @return {Object} Resources Definition
   */
  getResourceDefinition(key) {
    const resourceObjectKey = this.getResourceObjectKey(key);

    const definition = {
      type: 'object',
      properties: {
        links: {
          type: 'object',
          properties: {
            self: {
              type: 'string'
            }
          }
        },
        data: {
          $ref: this.getDefinitionRef(resourceObjectKey)
        }
      }
    };

    return definition;
  }

  /**
   * Get Resources Definition for specified Object key
   *
   * @param {string} key Object Key
   * @return {Object} Resources Definition
   */
  getResourcesDefinition(key) {
    const resourceObjectKey = this.getResourceObjectKey(key);

    const definition = {
      type: 'object',
      properties: {
        links: {
          type: 'object',
          properties: {
            self: {
              type: 'string'
            }
          }
        },
        data: {
          type: 'array',
          items: {
            $ref: this.getDefinitionRef(resourceObjectKey)
          }
        }
      }
    };

    return definition;
  }

  /**
   * Get Error Objects Definition
   *
   * @return {Object} Error Objects Definition
   */
  getErrorObjectsDefinition() {
    const definition = {
      properties: {
        errors: {
          type: 'array',
          items: {
            $ref: this.getDefinitionRef('ErrorObject')
          }
        }
      }
    };

    return definition;
  }

  /**
   * Get Error Object Definition
   *
   * @return {Object} Error Object Definition
   */
  getErrorObjectDefinition() {
    const definition = {
      properties: {
        status: {
          type: 'number',
          enum: [
            400,
            404,
            422,
            500
          ]
        },
        source: {
          type: 'string'
        },
        title: {
          type: 'string'
        },
        code: {
          type: 'string'
        },
        detail: {
          type: 'string'
        }
      }
    };

    return definition;
  }

  /**
   * Get Definition Reference for Definition Key
   *
   * @param {string} definitionKey Object Definition Key
   * @return {string} Definition Reference
   */
  getDefinitionRef(definitionKey) {
    return `#/definitions/${definitionKey}`;
  }

  /**
   * Get Error Objects Key
   *
   * @return {string} Error Objects Key
   */
  getErrorObjectsKey() {
    return 'ErrorObjects';
  }

  /**
   * Get Attributes Key based on Object Key
   *
   * @param {string} key Object Key
   * @return {string} Attributes Key
   */
  getAttributesKey(key) {
    return `${key}Attributes`;
  }

  /**
   * Get Resource Object Key based on Object Key
   *
   * @param {string} key Object Key
   * @return {string} Resource Object Key
   */
  getResourceObjectKey(key) {
    return `${key}ResourceObject`;
  }

  /**
   * Get Resource Key based on Object Key
   *
   * @param {string} key Object Key
   * @return {string} Resource Key
   */
  getResourceKey(key) {
    return `${key}Resource`;
  }

  /**
   * Get Resources Key based on Object Key
   *
   * @param {string} key Object Key
   * @return {string} Resources Key
   */
  getResourcesKey(key) {
    return `${key}Resources`;
  }

  /**
   * Get Object Type based on Object Key
   *
   * @param {string} key Object Key
   * @return {string} Dasherized and Pluralized Type
   */
  getType(key) {
    const typeKey = dasherize(key);
    return pluralize(typeKey);
  }

  /**
   * Delete Reserved Properties
   *
   * @param {Object} definition Object Definition
   * @return {undefined}
   */
  deleteReservedProperties(definition) {
    if (definition.properties) {
      this.reservedProperties.forEach(function(property) {
        delete definition.properties[property];
      });
    }

    if (definition.required) {
      this.reservedProperties.forEach(function(property) {
        const index = definition.required.indexOf(property);
        if (index >= 0) {
          definition.required.splice(index, 1);
        }
      });
    }
  }
};