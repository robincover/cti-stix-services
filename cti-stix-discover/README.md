# cti-stix-discover

REST services for interacting with [Structured Threat Information Exchange 2.0](http://stixproject.github.io/stix2.0/).

The application runs on [Node.js](https://nodejs.org) and is built using the [LoopBack](https://loopback.io) framework.

The application provides web services using the [JSON API](http://jsonapi.org) specification for interacting with STIX Objects.

## System Requirements

* [Node.js](https://nodejs.org)

## Container Configuration

The application incorporates a [Docker](https://www.docker.com) configuration.

### Docker Run

The Docker configuration requires linking to an instance of [CTI STIX Store](https://github.com/iadgov/cti-stix-services/tree/master/cti-stix-store).
The Docker application image for this application can be created using the following command:

```bash
docker build -t cti-stix-discover .
```

The CTI STIX Store container should be started with the following command to provide access over port 80:

```bash
docker run --name cti-stix-store --link mongo:repository cti-stix-store -d
```

The application can be started using Docker and linked to the CTI STIX Store container using the following command:

```bash
docker run --name cti-stix-discover --link cti-stix-store:cti-stix-gateway -p 3000:3000 cti-stix-discover
```

## Interface Specifications

The application includes a description of the services provided using the [OpenAPI](https://openapis.org) 2.0 Specification defined using [Swagger](http://swagger.io).
