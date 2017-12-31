FROM node:9

WORKDIR /app

ADD bg-client/package.json bg-client/package.json
ADD bg-server/package.json bg-server/package.json
ADD games/terraforming-mars/package.json games/terraforming-mars/package.json
ADD games/power-grid/package.json games/power-grid/package.json

RUN cd bg-client && npm i
RUN cd bg-server && npm i
RUN cd games/terraforming-mars && npm i
RUN cd games/power-grid && npm i

ADD . .

CMD cd bg-server && npm start