# PLACEHOLDER

A simple template for building JavaScript applications with LLMs like Claude Code.

> **Note:** Replace "PLACEHOLDER" with your project name throughout this repository, including in the package.json, HTML files, GitHub workflows, and this README.

## Philosophy

The main things to focus on are:
- **Boring tools**: Use libraries and tools that LLMs are likely to have more training data for
- **Simple**: Have as few moving parts as possible and avoid complex optimizations
- **Semi-complete**: Include a backend, frontend, and database, but make components easy to delete

## Features

- **Backend**: Hono server that serves the frontend and API routes
- **Frontend**: React with Tailwind CSS (loaded from CDN)
- **Database**: SQLite with sqlite3 and simple migration support
- **Development**: Hot reloading with Bun's watch mode
- **Deployment**: Docker containerization and GitHub Actions CI

## Project Structure

```
├── src/
│   ├── db/              # Database setup and seeding
│   ├── routes/          # API route handlers
│   ├── public/          # Static files served by the backend
│   │   ├── js/          # Frontend JavaScript
│   │   │   ├── components/ # React components
│   │   │   └── app.js   # Main frontend entry point
│   │   └── index.html   # HTML entry point
│   ├── test/            # Test files
│   └── index.js         # Main server entry point
├── .env                 # Environment variables
├── Dockerfile           # Docker configuration
├── .github/workflows/   # GitHub Actions CI configuration
└── package.json         # Project dependencies and scripts
```

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```
   bun install
   ```
3. Set up the database:
   ```
   bun run db:seed
   ```
4. Start the development server:
   ```
   bun run dev
   ```
5. Open http://localhost:3000 in your browser

## Docker

Build and run the Docker container:

```
docker build -t PLACEHOLDER .
docker run -p 3000:3000 PLACEHOLDER
```

## Customizing

This template is designed to be simple and easy to modify:

- **Adding API endpoints**: Add new routes in `src/routes/api.js`
- **Modifying the database**: Edit the schema in `src/db/setup.js`
- **Adding UI components**: Create new components in `src/public/js/components/`

## License

MIT
