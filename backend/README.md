You need 2 things currently to run the backend: The API and the Database Server.

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
