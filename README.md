This repo contains code for a small webpage/application that allows you draw on a basic HTML canvas and then view back the timelapse (the history of changes) of the canvas - built against XTDB Version 2.

<div style="margin: 0 auto">
  <img src="https://github.com/danmason/xtdb-easel-playground/assets/22668517/78315687-0b05-4732-9f8b-87d5c7b30401" width="400" />
  <img src="https://github.com/danmason/xtdb-easel-playground/blob/main/timelapse.gif" width="270" /> 
</div>

## Requirements

The webserver is run using npm & astro, and for XTDB we make use of the `xtdb-standalone-ea` docker image, so you will need the following to run the application:

- `npm`
- `Docker`

## Starting XTDB

Prior to running the webserver application itself, you will need an XTDB node running on port `3000`. We achieve this using the `xtdb-standalone-ea` image from the Github Container Repository.

- This runs an XTDB node inside of docker with a data will saved in a local directory in the Docker image - we will attach a host volume in the usual Docker way, to preserve the data on your host machine.

Firstly, pull the latest version of the standalone docker image:
```bash
docker pull ghcr.io/xtdb/xtdb-standalone-ea:latest
```

Then, run the docker container, attaching the container storage to a host volume:
```bash
docker run \
  -tip 3000:3000 \
  -v /xtdb-easel/data:/var/lib/xtdb \
  ghcr.io/xtdb/xtdb-standalone-ea
```

## Starting the application

Some commands for building & running the webpages using astro:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
