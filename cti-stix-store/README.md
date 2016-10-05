# cti-stix-store

REST services for [Structured Threat Information Exchange 2.0](http://stixproject.github.io/stix2.0/).

The application runs on [Node.js](https://nodejs.org) and is built using the [LoopBack](https://loopback.io) framework.

The application provides web services using the [JSON API](http://jsonapi.org) specification for producing and consuming STIX Objects.

## System Requirements

* [Node.js](https://nodejs.org)
* [MongoDB](https://www.mongodb.com)

## Container Configuration

The application incorporates a [Docker](https://www.docker.com) configuration and leverages [Docker Compose](https://www.docker.com/products/docker-compose).

The Docker Compose configuration depends on MongoDB and can be started using the following command:

```bash
docker-compose up
```

The configuration exposes access to MongoDB on port 27017 and provides access to REST services on port 3000.
