FROM node:latest
MAINTAINER "unfetter"
LABEL Description="CTI-STIX-UI"


ENV WORKING_DIRECTORY /usr/share/cti-stix-ui


RUN npm install -g ember-cli
RUN npm install -g bower

RUN mkdir -p $WORKING_DIRECTORY
WORKDIR $WORKING_DIRECTORY 
COPY package.json $WORKING_DIRECTORY
COPY bower.json $WORKING_DIRECTORY
COPY ember-cli-build.js $WORKING_DIRECTORY

RUN echo "Building cti-ui"

RUN npm install
RUN bower --allow-root install
RUN npm rebuild node-sass
#RUN ember build

COPY . $WORKING_DIRECTORY

# ports variables
EXPOSE 4200 50000 

CMD ["ember","server","--live-reload=port","50000"]
