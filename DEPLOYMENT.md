# Deployment Guide for TennisConnect

## Frontend Deployment (Netlify)

### Prerequisites
- A Netlify account
- Git repository with your TennisConnect frontend code

### Steps

1. **Prepare your frontend for deployment**
   - Ensure your `.env` file contains the correct environment variables:
     ```
     VITE_API_BASE_URL=https://tennisconnect-backend.railway.app
     VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
     ```
   - Make sure the `netlify.toml` and `public/_redirects` files are in place

2. **Deploy to Netlify**
   - Log in to your Netlify account
   - Click "New site from Git"
   - Connect to your Git provider and select the TennisConnect repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

3. **Configure environment variables in Netlify**
   - Go to Site settings > Build & deploy > Environment
   - Add the environment variables from your `.env` file

4. **Verify deployment**
   - Once deployment is complete, Netlify will provide a URL for your site
   - Test the site functionality, especially API calls to the backend

## Backend Deployment (Railway)

### Prerequisites
- A Railway account
- Git repository with your TennisConnect backend code

### Steps

1. **Prepare your backend for deployment**
   - Ensure your code is using environment variables for configuration
   - Make sure your `package.json` has a start script: `"start": "node server.js"`

2. **Deploy to Railway**
   - Log in to your Railway account
   - Click "New Project" > "Deploy from GitHub repo"
   - Select the TennisConnect backend repository
   - Configure environment variables:
     ```
     DATABASE_URL=postgresql://postgres:password@containers-us-west-1.railway.app:5432/railway
     DB_SSL=true
     JWT_SECRET=your_jwt_secret
     PORT=8080
     GOOGLE_CLIENT_ID=your_google_client_id
     ```
   - Click "Deploy"

3. **Set up PostgreSQL database**
   - In your Railway project, click "New" > "Database" > "PostgreSQL"
   - Once created, Railway will provide connection details
   - Update your `DATABASE_URL` environment variable with these details

4. **Initialize the database**
   - Connect to your Railway PostgreSQL instance
   - Run the schema.sql script to create tables and seed data

5. **Verify deployment**
   - Railway will provide a URL for your backend API
   - Test API endpoints using a tool like Postman or curl

## Connecting Frontend and Backend

1. **Update API base URL**
   - Ensure your frontend's `VITE_API_BASE_URL` points to your Railway backend URL
   - The `netlify.toml` and `_redirects` files should be configured to proxy API requests

2. **Test the complete application**
   - Register a new user
   - Log in with the registered user
   - Test all features: match scheduling, challenge requests, statistics, etc.

## Troubleshooting

- **CORS issues**: Ensure your backend has proper CORS configuration
- **Database connection errors**: Verify DATABASE_URL and DB_SSL settings
- **Authentication problems**: Check JWT_SECRET configuration
- **API proxy issues**: Verify netlify.toml and _redirects configurations
