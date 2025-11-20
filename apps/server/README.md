# Rovierr Server

This directory contains the server-side code for the Rovierr application. It is built using bun and hono with orpc, providing RESTful APIs for the frontend to interact with.

## Authentication with Better-Auth

whenever new plugin is added to better-auth run this command to generate the table and columns and then manually adjust according to the code styles of this repository. You will find auth related files in `lib` folder

```shell
npx @better-auth/cli generate
```

## Database Migrations with Drizzle ORM and Neon

Database migrations are managed using Drizzle ORM. To create and run migrations, use the following commands

```shell
bun db:generate
bun db:migrate
```

if you are working on a feature branch and want to quickly test your schema change without generating a new migration, you can use

```shell
bun db:push
```

This will push the current schema state to the database without creating a migration file. Remember to generate a proper migration before merging to main branch.
