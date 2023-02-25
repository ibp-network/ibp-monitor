FROM node:18
RUN npm install -g npm
RUN npm install -g @vue/cli

RUN mkdir -p /home/ibp
WORKDIR /home/ibp

COPY config.js .
COPY server.js .
COPY package.json .
COPY lib/ ./lib
COPY models/ ./models
COPY static/ ./static
COPY templates/ ./templates
# not needed vue-spa builds to ../static directory
# COPY vue-spa/ ./vue-spa

# RUN ls --recursive /home/ibp

RUN npm install
# RUN cd vue-spa && rm -rf node_modules && npm run build

VOLUME /data
VOLUME /home

EXPOSE 30000
EXPOSE 30001

CMD [ "node", "server.js" ]
