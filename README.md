# cti-stix-services

Applications for creating and interacting with [Structured Threat Information Exchange 2.0](http://stixproject.github.io/stix2.0/).

## System Requirements

* [Node.js](https://nodejs.org)
* [MongoDB](https://www.mongodb.com)

## Container Configuration

This projects incorporates a [Docker Compose](https://www.docker.com/products/docker-compose) configuration that integrates individual services and provides access through a single gateway.

### Docker Compose

The Docker Compose configuration can be started using the following command:

```bash
docker-compose up
```

The configuration starts MongoDB for storage of objects and also runs Nginx to provide a gateway to access REST services over port 8080.

## License 
See [LICENSE](LICENSE.md).

## Disclaimer
See [DISCLAIMER](DISCLAIMER.md).
