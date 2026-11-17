# Cloud & Production Deployment Guide

This guide details instructions for deploying the **Web Form Input Validation Engine** to local containers, cloud PaaS providers (Render, Railway), and connecting with MongoDB Atlas.

---

## 1. Quick Local Docker Deployment

Run the entire application (Frontend, Backend, and MongoDB) with a single command:

```bash
docker compose up --build -d
```

- Access the unified application at: `http://localhost:5000`
- Check container status:
  ```bash
  docker compose ps
  ```
- View application logs:
  ```bash
  docker compose logs -f validation-engine
  ```
- Stop the application:
  ```bash
  docker compose down
  ```

---

## 2. Deploying to Cloud Providers (e.g., Render, Railway)

The application includes a unified production setup where Express serves the static React build when `NODE_ENV=production`.

### Step 1: Push Repository to GitHub
```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

### Step 2: Configure MongoDB Atlas (Free Tier)
1. Sign up or log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new free cluster (M0 Shared).
3. Under **Security &rarr; Database Access**, create a database user (e.g., `appUser`) with password.
4. Under **Security &rarr; Network Access**, add IP `0.0.0.0/0` (allow access from anywhere) so cloud servers can connect.
5. In your cluster dashboard, click **Connect &rarr; Drivers &rarr; Node.js** and copy your connection string:
   ```
   mongodb+srv://appUser:<password>@cluster0.mongodb.net/validation_engine?retryWrites=true&w=majority
   ```

### Step 3: Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New &rarr; Web Service**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start`
4. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `MONGODB_URI` = `<your-mongodb-atlas-uri>`
5. Click **Create Web Service**. Render will automatically build the client and start the server.

## Deploying the frontend to Vercel

The repository root contains the `vercel.json` configuration. It installs the client dependencies, builds the Vite app in `client/`, and publishes `client/dist/` so the Vercel project serves the actual website instead of an empty repository root.

1. Import the repository into Vercel and leave **Root Directory** set to the repository root (the folder containing `vercel.json`).
2. Let the checked-in `vercel.json` provide the build command and output directory. If the Vercel project has dashboard overrides for either value, clear those overrides so they do not replace the checked-in settings.
3. Deploy the project. The frontend will be available at the deployment's root URL.

The backend is a separate Express app in `server/`; deploying only the frontend does not deploy the API. Deploy `server/` as a separate Vercel project with its **Root Directory** set to `server`, then set `VITE_API_URL` in the frontend project's environment variables to `https://<backend-domain>/api` and redeploy the frontend. Set `CLIENT_URL` in the backend project to the frontend's exact Vercel URL. Database-backed features also require a reachable MongoDB instance configured with `MONGODB_URI`.

---

## 3. Environment Variables Reference

| Variable | Description | Default (Development) | Production Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Listening port for Express | `5000` | `5000` |
| `NODE_ENV` | Environment mode | `development` | `production` |
| `CLIENT_URL` | Frontend origin for CORS | `http://localhost:5173` | `https://your-app.onrender.com` |
| `MONGODB_URI` | MongoDB Connection URI | `mongodb://127.0.0.1:27017/validation_engine` | `mongodb+srv://...` |

---

## 4. Production Verification Checklist

- [x] Multi-stage `Dockerfile` created with separate build and runner stages.
- [x] Docker Compose configured with health-checked MongoDB service.
- [x] Express configured to serve `client/dist` in production mode.
- [x] CORS origin configurable via `CLIENT_URL`.
- [x] MongoDB credentials safely isolated in environment variables.
