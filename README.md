# Project Name & Description

## Nexastack Platform

Nexastack Team Creation contains the auth service of Nexastack Platform Dashboard, built with React, TypeScript, Vite, and TanStack Router.
<br>

# Project Status

This project is currently in development.
<br>

# Installation and Setup Instructions

Below you will find some information on how to perform Installation and Setup tasks.
<br>

## Run App in Localhost/Development mode

**Clone this repository**

```
git clone "https://git.neuralcompany.team/ai-and-analytics/nexastack-ai/nexastack-ai-frontend/nexastack-ai-backend/nexastack-ai-frontend.git"
```

**Install Dependency**

```
npm install
```

**Start the application in development mode**

```
npm run dev
```

**Or start with a specific environment**

```
npm run dev:local    # Local development
npm run dev:prod     # Production-like environment locally
```

**To Run the Unit Test**

```
npm run test
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser (or the port shown in your terminal).

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

Static files are served from the `public` folder, project TypeScript files are in the `src` folder.
<br>
<br>

## Folders and Files Structure

Your project directory should look something like this:

```
nexastack-ai-frontend
  README.md
  node_modules/
  package.json
  tsconfig.json
  vite.config.js
  index.html
  public/
    favicon.ico
    ...
  src/
    api/
    assets/
    components/
    constants/
    hooks/
    lib/
    routes/
    store/
    theme/
    types/
    utils/
    main.tsx
    routeTree.gen.ts
    styles.css
```

For the project to build, **these files must exist with exact filenames**:

- `index.html` is the page template
- `src/main.tsx` is the TypeScript entry point
- `src/routeTree.gen.ts` is the generated TanStack Router routes file

You can delete or rename other files as needed.
<br>
<br>

### Build App for Development Environment

To build the project for Development Environment run:

```
npm run build:dev
```

And serve locally with:

```
npm run serve
```

<br>
<br>

### Build App for Production Environment

To build the project for Production Environment run:

```
npm run build:prod
```

And serve locally with:

```
npm run serve
```

<br>
<br>

## Endpoints

    http://localhost:5173             // for development build (default Vite port)
    http://localhost:4173             // for preview of production build

# Environment Variables

The project uses environment variables for different environments:

- `.env` - Base environment variables
- `.env.development` - Development environment
- `.env.devlocal` - Local development environment
- `.env.production` - Production environment

## Change log

### Step to Re-brand Product -

1. Update the color code in `src/styles.css` file.

```
:root {
  --primary-color-code: #DD8E03;
  --secondary-color-code: #9E6B11;
}
```

2. Rename the images
3. Update theme settings in `src/theme` directory
