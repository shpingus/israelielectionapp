# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Response Monitoring & Analytics (Cloudflare D1)

This project is configured with a secure serverless backend to monitor user survey responses anonymously using **Cloudflare Pages Functions** and **Cloudflare D1** (SQLite at the edge).

### Local Development

To run both the React frontend and the serverless functions locally:

1. **Initialize the local SQLite database**:
   ```bash
   npx wrangler d1 execute DB --local --file=./schema.sql
   ```

2. **Run the Wrangler Pages developer server** (handles serverless API routes on port 8788):
   ```bash
   npx wrangler pages dev dist --local --port 8788
   ```

3. **Run the Vite developer server** (in a separate terminal, proxies `/api` calls to Wrangler):
   ```bash
   npm run dev
   ```

4. **Verify database writes**:
   After completing a quiz, the frontend will post stats to `/api/submit-response`. You can inspect the local SQLite rows by querying:
   ```bash
   npx wrangler d1 execute DB --local --command="SELECT * FROM responses LIMIT 5;"
   ```
   Or visit the local stats endpoint in your browser: `http://localhost:8788/api/stats`.

### Production Deployment

To connect and deploy the database on Cloudflare Pages:

1. **Create the D1 database** in your Cloudflare account:
   ```bash
   npx wrangler d1 create elections-db
   ```
   *Note: This command will output your database ID. Copy it.*

2. **Update configuration**:
   Replace the placeholder `database_id` in `wrangler.json` with your new production database ID:
   ```json
   "database_id": "YOUR-ACTUAL-D1-DATABASE-ID"
   ```

3. **Bind D1 in the Cloudflare Dashboard**:
   - Go to your project in the **Cloudflare Pages Dashboard**.
   - Navigate to **Settings** -> **Functions**.
   - Under **D1 database bindings**, click **Add binding**.
   - Set **Variable name** to `DB`.
   - Set **Database** to `elections-db`.
   - Save and redeploy.

4. **Run production database migration**:
   Initialize the tables in the production D1 instance:
   ```bash
   npx wrangler d1 execute elections-db --remote --file=./schema.sql
   ```

