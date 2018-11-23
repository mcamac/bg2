# bg2

[![CircleCI](https://circleci.com/gh/mcamac/bg2.svg?style=svg&circle-token=b40e15db2a3165c6e3be1e22f893f644277f3182)](https://circleci.com/gh/mcamac/bg2)

Some boardgames.

## Dev Setup (Without Docker)

First:

```
cd games/power-grid && npm i
cd games/terraforming-mars && npm i
```

Run a local redis:

```
brew install redis
redis-server
```

### Server

```
cd bg-server && npm start
```

### Client

```
cd bg-client && npm start
```
