# This is a 'demo' restaurant project, for my interview prep. (Abi)

Hi, I'm Abi. This project was created with Node.js, GraphQL, Microsoft SQL (Azure SQL), Next.js and Apollo Client/Server (for GraphQL). Code editor used was Visual Studio, though I made extensive use of Cursor AI (an AI-powered code editor build on top of VS Code) for building out the frontend -- for massive efficiency gains.

It contains a demo Azure Functions backend (`culvers-order-demo-backend`) and a Next.js frontend (`culvers-order-demo-frontend`).

## Requirements

- **Node.js 18+** – install from [nodejs.org](https://nodejs.org/).
- **Azure Functions Core Tools** – follow the [official instructions](https://learn.microsoft.com/azure/azure-functions/functions-run-local) for your OS.

- ## Setup

Navigate to the package you want to run (e.g. `culvers-order-demo-backend`) and run:

```bash
npm install
npm run build
npm test
npm start
```

`npm start` launches the Azure Functions runtime locally.

## Environment Variables

The backend expects the following variables, typically supplied via a `local.settings.json` file:

- `DB_USER` – database username
- `DB_PASSWORD` – database password
- `DB_DATABASE` – database name
- `DB_SERVER` – hostname of the SQL server
- `DB_PORT` – TCP port (default `1433`)
- `DB_ENCRYPT` – `true` to enable encryption

### Sample `local.settings.json`

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "DB_USER": "your-user",
    "DB_PASSWORD": "your-password",
    "DB_DATABASE": "your-db",
    "DB_SERVER": "localhost",
    "DB_PORT": "1433",
    "DB_ENCRYPT": "false"
  }
}
```

Place this file in the `culvers-order-demo-backend` directory when running locally.