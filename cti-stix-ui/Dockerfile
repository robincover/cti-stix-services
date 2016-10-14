FROM node:6.8

MAINTAINER "unfetter"
LABEL Description="CTI-STIX-UI"


ENV WORKING_DIRECTORY /cti-stix-ui

# Set Environment for Application
ENV NODE_ENV docker

RUN mkdir -p $WORKING_DIRECTORY
WORKDIR $WORKING_DIRECTORY 
COPY package.json $WORKING_DIRECTORY
COPY bower.json $WORKING_DIRECTORY
COPY ember-cli-build.js $WORKING_DIRECTORY
#RUN chown -R $USER:$USER_GROUP *


# Install SupervisorD
#RUN $YUM_INSTALL python-setuptools
#RUN easy_install supervisor
#COPY resources/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

#RUN echo "Installing Apache HTTP Server"
#RUN $YUM_INSTALL httpd mod_ssl

#RUN echo "Configuring Apache HTTP Server"
#RUN cp -r $RESOURCES_PATH/httpd-unfetter.conf $HTTPD_CONFIG_PATH/conf.d/unfetter.conf
#RUN sed -i -e "s/SSLProtocol all -SSLv2/SSLProtocol TLSv1.2/g" $HTTPD_SSL_CONF


#RUN echo "Installing Git"
#RUN $YUM_INSTALL git

#RUN echo "Downloading Swagger from [$SWAGGER_UI_URL]"
#RUN git clone $SWAGGER_UI_URL $SWAGGER_CLONE_PATH

#RUN echo "Installing Swagger"
#RUN cp -r $SWAGGER_CLONE_PATH/dist $SWAGGER_SERVER_PATH
#RUN sed -i -e "s|http://petstore.swagger.io/v2|/unfetter-discover-api|g" $SWAGGER_INDEX_HTML

#RUN echo "Starting Apache HTTP Server"
#systemctl enable httpd
#systemctl start httpd

#RUN /usr/sbin/apachectl &


#RUN echo "Updating Server Certificate Permissions"
#RUN chmod 640 $SERVER_CRT
#RUN chgrp $USER_GROUP $SERVER_CRT
#RUN chgrp $USER_GROUP $SERVER_KEY

#USER $USER
RUN echo "Installing cti-ui dependencies"
#RUN $YUM_INSTALL gcc-c++
RUN npm install -g bower 
RUN npm install -g ember-cli

RUN echo "Building cti-ui"


RUN npm install
RUN bower --allow-root install
RUN npm rebuild node-sass
#RUN ember build

WORKDIR $WORKING_DIRECTORY 
COPY . $WORKING_DIRECTORY

USER root

#systemctl enable cti-stix-ui
#systemctl start cti-stix-ui
#RUN /usr/bin/node /unfetter/unfetter-discover-api/server.js &
#RUN /usr/bin/ember serve --live-reload-port 50000 --ssl --ssl-key /etc/pki/tls/private/localhost.key --ssl-cert /etc/pki/tls/certs/localhost.crt &

# RUN command of bootstrap
#RUN /bin/bash -c 'chmod +x /unfetter/resources/bootstrap.sh'
#RUN /bin/bash -c '/unfetter/resources/bootstrap.sh'


# ports variables
EXPOSE 4200 50000 

WORKDIR $WORKING_DIRECTORY/app

ENTRYPOINT ["ember","server"]

