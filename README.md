# chat-backend

Back end for a hobby chat application.
Author Perttu Kärnä

## Tech stack

Core technologies used:

* [Express](https://expressjs.com/) as core REST api
* [Express-JWT](https://github.com/auth0/express-jwt) for auth management
* [Sequelize](https://github.com/sequelize/sequelize) as ORM
* [PostgreSQL](https://www.postgresql.org/) as database
* [Docker](https://www.docker.com/) as container platform
* [Jest](https://facebook.github.io/jest/) as testing framework

## To get this running locally

To get this project running locally, you'll need Docker and docker-compose tools. This project uses docker-compose reference v2.

### Steps

1. Clone this repository to your local machine
2. Create a volume container for the database by running `docker volume create --name=chatdb`
3. Build containers by running `docker-compose build` in the project root
4. Run containers with `docker-compose up` (provide -d flag for running in background)
    * The back end will be available at localhost, port 3000
    * To get into the containers, find out containers id or name by running `docker ps` and then run `docker exec -it <container-id-or-name> /bin/sh`
5. Press **Ctrl + C** to shut down the containers
    * If running on background, or if the containers abort, run `docker-compose down` in the project root

For more docker commands read [their documentation](https://docs.docker.com/).

## Tests

There is REST API tests for this project at [tests](tests) -folder. To run tests locally, use docker-compose-test.yml -file. Please note, that this will run tests continuously.

### Run tests without Docker environment

* For single run, use `npm test`
* For continuous testing, use `npm run test:ci`
    * This will watch for file changes and runs the tests when changes are detected
* Please note that you'll need PostgreSQL database and correct configs for local database in [config.js](config/config.js)

### Run tests in Docker environment

If you want to run a single run, change the docker-compose-test.yml to use command `npm test` for running the app container. For continuous run, it should be `npm run test:ci`.

1. Build images by `docker-compose -f docker-compose-test.yml build`
2. Run containers by `docker-compose -f docker-compose-test.yml up`
    * If you need to change container build process (Dockerfile.test) or package.json -file, just run `docker-compose -f docker-compose-test.yml up --build` to build and run containers
3. Bring the containers down with **Ctrl + C**
