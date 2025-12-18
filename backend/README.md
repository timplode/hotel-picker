You need 2 things currently to run the backend: The API and the Database Server.

# Database

The easiest way to install a database server is to first download docker, which runs containerized applications, including the database server. This will ensure the DB server is consistent with the application. Download Docker Desktop at https://www.docker.com/products/docker-desktop/

Then in backend directory run the following command. This will start the database and set up permissions for the app.
```
docker-compose up
```

###### Import 

For our database to be useable, we need to import our base data set. This command is also run from backend dir.

```
npm run import
```

# API

Strapi is used to create an API between the frontend and the database. 

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run dev
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start) This is used in production environment.

```
npm run start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build). Useful to build panel before deployment to production.

```
npm run build
```

# Database

```
docker-compose up
```

This will start the database, set up permissions for the app, and pre-load data from the temp/ directory
