# Library

Browse, borrow and return books. ASP.NET Core API with SQLite, Next.js frontend.

## Prerequisites

- .NET 10 SDK
- Node.js 20.9+

## Setup

```bash
dotnet dev-certs https --trust
cd library-web
npm install
npm run certs
```

`npm run certs` exports the dev certificate for Node, which does not read the
Windows certificate store. Without it every page fails with a TLS error.

## Run

Two terminals:

```bash
cd Library.Api/Library.Api
dotnet run --launch-profile https
```

```bash
cd library-web
npm run dev
```

Open http://localhost:3000. The database is created and seeded on first start.
