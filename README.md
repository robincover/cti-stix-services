# cti-stix-services

Applications for creating and interacting with [Structured Threat Information Exchange 2.0](http://stixproject.github.io/stix2.0/).

## System Requirements
The CTI-STIX-SERVICES project is a set of Docker containers running Node.js based applications.
* [Node.js](https://nodejs.org) running on the host system is helpful for development
* [Docker](https://www.docker.com)

## Container Configuration

This projects incorporates a [Docker Compose](https://www.docker.com/products/docker-compose) configuration that integrates individual services and provides access through a single gateway.

### Docker Compose

The Docker Compose configuration can be started using the following command:

```bash
docker-compose up
```
For development, it is helpful to be able to change code on the fly from the host system and have it update in the container.  Thus, start up docker with
```bash
docker-compose -f docker-compose.yml -f docker-compose.development.yml up
```
### Getting started

Once docker-compose runs successfully, the main CTI-STIX User Interface is running.  You may access the UI through
```bash
https://localhost/cti-stix-ui/
```

To view the cti-stix-store REST API, just go to
```bash
https://localhost/cti-stix-store-api/specifications/
```



## License 
See [LICENSE](LICENSE.md).

## Disclaimer
See [DISCLAIMER](DISCLAIMER.md).
