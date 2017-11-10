# chat-backend

Back end for [Slack](https://slack.com)-ish chat application.
Author Perttu Kärnä

## Tech stack

Core technologies used:

* [Express](https://expressjs.com/) as core REST api
* [Express-JWT](https://github.com/auth0/express-jwt) for auth management
* [Sequelize](https://github.com/sequelize/sequelize) as ORM
* [PostgreSQL](https://www.postgresql.org/) as database
* [Docker](https://www.docker.com/) as container platform

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

For more docker commands read their documentation.
