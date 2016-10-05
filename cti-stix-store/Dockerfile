FROM node:latest

ENV WORKING_DIRECTORY /usr/share/cti-stix-store

# Create Application Directory
RUN mkdir -p $WORKING_DIRECTORY
WORKDIR $WORKING_DIRECTORY

# Install Dependencies
COPY package.json $WORKING_DIRECTORY
RUN npm install
COPY . $WORKING_DIRECTORY

# Set Environment for Application
ENV NODE_ENV docker

# Start Application
EXPOSE 3000
CMD [ "npm", "start" ]
