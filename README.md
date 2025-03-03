# Trackmate

Trackmate is a comprehensive web application designed for simracing teams to streamline their racing operations and enhance team collaboration. It's an all-in-one solution that eliminates the need to search across multiple Discord servers for essential information and tools. The app provides tools for scheduling and managing racing events, and tracking race results. Most importantly, its integrated telemetry sharing system allows drivers to exchange and study performance data, helping the entire team improve their racing capabilities.

## Local setup

### Prerequisites

Please ensure you have the following installed:

- Node.js
- Package manager (such as `npm` or `bun`)
- Git

### Steps

1. Clone the repository

   Open your terminal and run:

   ```bash
   git clone https://github.com/matibox/trackmate.git
   ```

2. Install dependencies using `npm` or `bun`

   Go to project directory

   ```bash
   cd trackmate
   ```

   Install dependencies

   ```bash
   npm install
   bun install
   ```

3. Setup environment variables

   First, copy `.env.example` and rename it to `.env`

   **AUTH_SECRET**

   It's needed for `NextAuth`, can be any string

   **DATABASE_URL**

   Defaults to `file:./db.sqlite`. If you have your own SQLite database, insert its connection string here.

   ### Discord OAuth authentication

   Please follow instructions from [here](https://create.t3.gg/en/usage/next-auth#setting-up-the-default-discordprovider)

4. Push the database using `npm` or `bun`
   ```bash
   npm run db:push
   bun run db:push
   ```
5. Build the project using `npm` or `bun`
   ```bash
   npm run build
   bun run build
   ```
6. Run the server using `npm` or `bun`

   ```bash
   npm start
   bun start
   ```

   After a while, the server should be up on http://localhost:3000/
