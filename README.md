# Dokku Dashboard
This project is a web application that acts as a dashboard interface for the Dokku CLI. The goal is to simplify and enhance the user experience when managing applications through Dokku by providing an intuitive and interactive visual interface.

Dokku Dashboard is a frontend server only, that uses the [Dokku-API](https://github.com/JeanExtreme002/Dokku-API) as backend.

## Getting Started (quick run)

The entire project has been built to run entirely on [Docker](https://www.docker.com/).

Create a `.env` from `.env.sample` and execute the command below to run the application:

```
$ make docker-run
```

Now, open the website on your browser at [localhost:3000](http://localhost:3000) — if you did not change the default settings.

## Getting Started (development)

Install the dependencies for the project — it uses [pnpm](https://pnpm.io/):

```
$ make install
```

Now, you can run the server with:

```
$ make run
```

Run `make help` to learn about more commands.

## Tests

Run commands below to test the project:
```
$ pnpm test        # Run the tests
$ pnpm test:watch  # Run the tests in watch mode
$ pnpm test:e2e    # Run the integration tests using Cypress
```

Use the following command to open Cypress:
```
$ pnpm cypress
```

## Coding Style

Run the commands below to properly format the project's code:

```
$ pnpm lint        # Run lint
$ pnpm lint:fix    # Run lint autofix
```

Check out the `package.json` to learn about more scripts.
