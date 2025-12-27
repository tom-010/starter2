# Starter Project Overview

A comprehensive guide to understanding this starter project, written as a narrative suitable for presentations and onboarding.

---

## Introduction

This repository is a production-ready starter template for building business-to-business web applications. It represents a carefully considered set of technology choices optimized for developer velocity and maintainability rather than theoretical scale. The philosophy can be summarized as "boring is better" — prioritizing proven technologies with known failure modes over trendy alternatives that introduce unquantified risk.

The project includes a complete demonstration application — a todo manager with projects, file attachments, user assignments, and admin functionality — that serves as a reference implementation of all patterns. This demo is intended to be studied and then replaced with your own application code.

---

## Core Philosophy

### Code as Liability

Every line of code creates maintenance debt. The objective is maximum utility with minimum syntax. Rather than measuring code quality by abstract metrics like test coverage or design pattern usage, the only meaningful measure is how easily the system can be modified. A rigid, thoroughly tested system that resists change is considered a failure. Therefore, the approach strongly favors removing code over adding it, and explicit duplication is preferred over premature abstraction. Abstractions introduce invisible dependencies that can cripple future development velocity.

### Cognitive Load is the Bottleneck

Software development velocity is constrained by the developer's working memory, not by CPU cycles or network bandwidth. "Clever" code exhausts this limited cognitive resource, while "boring," predictable code preserves it for domain logic where creativity actually matters. The project enforces strict uniformity in implementation details to eliminate decision fatigue. Related logic is co-located in the same file whenever possible to minimize context switching. Coupling between modules is treated as the primary enemy because it prevents reasoning about one part of the system in isolation.

### Architect for Now, Not Later

Speculative architecture for hypothetical future requirements is resource waste. The project is designed for approximately ten users, and that's intentional. When you need to scale beyond that, you'll refactor — but you'll be refactoring based on actual requirements rather than imagined ones. The technology choices emphasize "Lindy" technologies — tools that have been around long enough that their failure modes are well understood. SQL databases, HTTP, and server-side rendering have decades of production experience behind them. Novelty introduces unquantified risk.

### Value Follows a Power Law

Most of the value in any application comes from a small number of features. Perfectionism in secondary UI elements or edge cases is economic malpractice. Real-world usage is the only valid way to determine what matters, so rapid, imperfect shipping outperforms perfect planning. A solution only exists when it delivers value to users; until then, it's merely inventory.

---

## Technology Choices

### Frontend Framework: React Router v7

React Router version 7 serves as the full-stack framework, handling both server-side rendering and client-side navigation. This is a significant evolution from earlier versions of React Router that only handled client-side routing. Version 7 provides a complete application framework comparable to Next.js or Remix, but with a simpler mental model.

The framework uses what's called "file-based routing with explicit registration" — route files exist in a routes directory, but they must be explicitly registered in a central routes file. This differs from purely file-system-based routing (where the file location determines the URL) and provides better discoverability when working in large codebases.

Server-side rendering is enabled by default, meaning the initial page load is rendered on the server and sent as complete HTML. This improves perceived performance and search engine optimization. After the initial load, navigation between pages happens client-side without full page reloads, providing a smooth single-page application experience.

### Styling: Tailwind CSS with Shadcn UI

The project uses Tailwind CSS version 4 for styling, which works through utility classes applied directly in the markup rather than separate stylesheets. This approach keeps styles co-located with the components they affect and eliminates the need to context-switch between HTML and CSS files.

Shadcn UI provides pre-built components that work with Tailwind. Unlike traditional component libraries that are installed as npm packages, Shadcn components are copied directly into your project and can be modified freely. This gives you ownership of the component code while still benefiting from well-designed defaults. The components are built on Radix UI primitives, which handle accessibility concerns like keyboard navigation and screen reader support.

A strict constraint of the project is that no custom CSS is written. Every visual change must use Tailwind utility classes or Shadcn components. This eliminates debates about CSS methodology and ensures consistent styling across the application.

### Database: PostgreSQL with Prisma ORM

PostgreSQL serves as the database, providing a mature, reliable relational data store. The project includes Docker Compose configuration for running PostgreSQL locally with a single command.

Prisma version 7 serves as the Object-Relational Mapping layer. Prisma uses a schema file that defines your data models in a declarative format. From this schema, Prisma generates TypeScript types and a query client. This means database queries are fully type-safe — the TypeScript compiler will catch errors like querying for fields that don't exist or passing wrong types to filters.

The database schema is synchronized to the actual database using the "push" command, which directly applies changes without generating migration files. This is appropriate for development and prototyping. For production systems with existing data, you would switch to explicit migrations.

Prisma Studio provides a graphical interface for browsing and editing database content, which is invaluable during development for inspecting data and manually fixing records.

### Authentication: BetterAuth

BetterAuth provides authentication with email and password login. It integrates with Prisma for storing user data, sessions, and accounts. The authentication tables are defined in the same Prisma schema as the application models.

A deliberate choice is that user self-registration is disabled. Users must be created by administrators through a command-line tool or the admin interface. This matches the reality of most B2B applications where users are provisioned by the organization rather than signing up independently.

The project includes role-based access control with two roles: user and admin. Roles are stored as a JSON array in the user record, allowing users to have multiple roles. Helper functions check role membership and protect routes that require specific roles.

Authentication state is maintained through HTTP-only cookies, which provide security against cross-site scripting attacks. The session token is verified on every request using middleware that runs before route handlers.

### Background Jobs: Graphile Worker

For tasks that should happen asynchronously — like processing uploaded images or sending emails — the project uses Graphile Worker. This library stores jobs in the PostgreSQL database, eliminating the need for a separate message queue like Redis or RabbitMQ.

Jobs are defined as TypeScript functions that receive a payload and execute the work. A separate worker process polls the database for pending jobs and executes them. The worker is started alongside the development server and handles job processing continuously.

The demo application uses background jobs for generating image thumbnails. When a user uploads an image attachment, a job is queued that will call the Python service to resize the image. This keeps the HTTP response fast while the image processing happens in the background.

### Optional Python Service

For compute-heavy tasks that benefit from Python's ecosystem — particularly image processing and machine learning — the project includes an optional Python service using FastAPI. This is not a REST API in the traditional sense but rather a Remote Procedure Call interface between TypeScript and Python.

The Python service runs alongside the Node.js server and is only called from server-side code — never from the browser. Think of it as a way to extend TypeScript with Python capabilities while maintaining type safety across the boundary.

When you define an endpoint in Python using FastAPI and Pydantic models, a build script generates TypeScript types and client code automatically. This means calling Python from TypeScript looks and feels like calling any other TypeScript function, with full autocompletion and type checking.

The demo application uses Python for image thumbnail generation, leveraging the Pillow library for image manipulation.

---

## Project Structure

### Directory Organization

The project follows a straightforward directory structure. The main application code lives in an "app" directory. Within this, there are subdirectories for routes (page components with their loaders and actions), components (shared UI elements), lib (utility functions and configuration), and db (database client setup).

The routes directory contains individual files for each page or API endpoint. Each route file can export multiple things: a component for rendering, a loader function for fetching data, an action function for handling form submissions, and metadata for the page title and description.

The lib directory contains utility code organized by concern. There are files for authentication, configuration, form handling, logging, schemas, roles, and utilities. This co-located approach means everything related to a particular concern lives in one place.

The components directory is split between application-specific components (like the sidebar and page header) and generic UI components in a ui subdirectory. The UI components are the Shadcn primitives that have been added to the project.

A prisma directory contains the database schema and seed scripts. The seed script creates a test user for development and is run automatically before end-to-end tests.

A scripts directory contains standalone scripts: the background worker runner, a user management command-line tool, and the Python SDK generator.

The py directory contains the Python service code, including the FastAPI application and its dependencies managed through uv, a fast Python package installer.

### Configuration Files

The project includes numerous configuration files, each serving a specific purpose. The package.json defines npm scripts and dependencies. The tsconfig.json configures TypeScript with path aliases so imports can use a tilde prefix instead of relative paths. The vite.config.ts configures the build tool with plugins for Tailwind, React Router, and automatic Python SDK synchronization.

A components.json file configures Shadcn's component installation, specifying paths and styling options. The react-router.config.ts enables server-side rendering and the middleware feature for authentication.

Environment variables are defined in a .env file and validated at startup using a schema. Missing or invalid configuration causes the application to fail immediately with a clear error message rather than partially working and failing unpredictably later.

---

## Application Patterns

### Data Loading and Mutation

The project follows a pattern where data loading happens in loader functions and mutations happen in action functions. Both are defined in the route file alongside the component, keeping related logic together.

Loaders run on the server when a page is requested. They fetch data from the database and return it to the component. The component receives this data as props and can trust that it's already loaded — there's no need for loading spinners or error states for the initial data fetch.

Actions handle form submissions. When a form is submitted, the action function receives the form data, validates it, performs the database operation, and either returns errors or redirects to another page. This is a progressive enhancement pattern — forms work without JavaScript, with validation happening on the server. When JavaScript is available, client-side validation provides faster feedback.

A key constraint is that separate API routes are forbidden except for the authentication endpoint. All data mutation logic lives in action functions co-located with the UI that triggers them. This prevents the scattered, hard-to-trace data flow that happens when mutations are spread across many API endpoints.

### Form Handling

Forms use Zod schemas for validation, with the same schema used on both client and server. A schema defines the expected structure and validation rules for form data. Helper functions convert FormData objects to plain objects and run them through the schema.

On the server, if validation fails, the action returns the validation errors. On the client, these errors are displayed next to the relevant form fields. If JavaScript is enabled, the same validation runs on submit before the form is sent to the server, providing immediate feedback.

For forms that handle multiple actions (like a page where you can create, update, or delete items), the convention is to include a hidden "intent" field that specifies which action to take. The action function switches on this intent to dispatch to the appropriate handler.

### Authentication and Authorization

Every route except the login page requires authentication. This is enforced through middleware that runs before any route handler. If no valid session exists, the middleware redirects to the login page. This centralized approach ensures authentication can't be accidentally omitted from a new route.

For routes that require specific roles, additional checks run in the loader or action. A helper function verifies the user has the required role and throws a forbidden response if not. The admin section of the demo application demonstrates this pattern.

The authentication system uses HTTP-only cookies for session storage. Cookies are automatically included with every request, so there's no need to manually attach tokens to fetch calls. The session token is verified on each request by looking it up in the database.

### Layout and Navigation

The application shell consists of a sidebar for navigation and a header with breadcrumbs. These are rendered by the root layout component, which wraps all other routes. The login page is handled specially, bypassing the layout to show a full-page login form.

The sidebar displays navigation items organized into groups. The items shown depend on the user's role — admin users see an additional admin section. A search box filters the navigation items for quick access in larger applications.

Breadcrumbs are defined per-route using a handle export. Each route specifies its breadcrumb label and optionally a link. For dynamic routes (like viewing a specific project), the breadcrumb can be a function that receives the loader data and returns the label. The page header collects breadcrumbs from all matched routes to build the complete trail.

---

## The Demo Application

### Data Model

The demo implements a todo application with projects, todos, attachments, and user assignments. Projects contain todos, and todos can have file attachments and be assigned to multiple users.

The User model comes from BetterAuth but is extended with a roles field. Sessions, accounts, and verifications are BetterAuth infrastructure tables for managing authentication state.

Projects are simple containers with a name, description, and color. Deleting a project cascades to delete all its todos.

Todos belong to a project and have an owner (the user who created them). They have a title, optional description, priority level, optional due date, and completion status. Beyond ownership, todos can be assigned to additional users who gain read access but not edit rights.

Attachments are files uploaded to todos. The file is stored on disk in a public directory, while metadata (filename, path, size, type) is stored in the database. For images, thumbnails are generated asynchronously and stored alongside the original.

### User Flows

The main flows in the demo are creating projects, adding todos, managing todo details, and administering users.

Project creation happens inline on the projects list page. A form at the top accepts a project name, and submitting it creates the project and redirects to its detail page.

On the project detail page, todos can be added via an inline form. The todo table shows all todos with checkboxes for completion status and badges for priority. Clicking a checkbox toggles completion. Clicking the priority badge cycles through low, medium, and high. Clicking the title navigates to the todo detail page.

The todo detail page shows all metadata and has sections for assigned users and attachments. The owner can edit the todo, assign other users, and upload files. Assigned users can view the todo and upload files but cannot edit or manage assignments.

The admin section is only accessible to users with the admin role. It shows all users and allows creating, editing, and deleting accounts. Admins can assign roles to users. Safety measures prevent admins from deleting themselves or removing their own admin role.

### Debug Page

A debug page demonstrates the Python bridge by calling Python endpoints from the browser. It shows a health check call and a typed RPC call with form inputs. This is useful for verifying the Python service is running and the SDK is correctly generated.

---

## Development Workflow

### Getting Started

Starting the project requires Docker for the database, Node.js for the application, and Python with uv for the optional Python service. With these installed, you start the database container, install dependencies, push the schema to the database, seed a test user, and start the development servers.

The main development command starts three processes concurrently: the Vite development server with hot module replacement, the Graphile Worker for background jobs, and the Python service for image processing. Colored output labels make it easy to distinguish which process is logging.

### Database Changes

When modifying the database schema, you edit the Prisma schema file and run the migrate command to push changes to the database. Then you regenerate the Prisma client so TypeScript knows about the new types. If you add fields to existing tables with data, you may need to provide default values or make them optional.

Prisma Studio provides a graphical interface for viewing and editing data. This is particularly useful during development for checking that data was created correctly or manually fixing test data.

### Adding Components

Adding new UI components uses the Shadcn CLI. You specify the component name, and it downloads the component code into your project. The component is immediately available to import. You can then customize it as needed since you own the code.

### Python Changes

When modifying the Python service, changes are automatically detected and the service restarts. The Vite development server watches for Python changes and regenerates the TypeScript SDK automatically. This means you can add a Python endpoint and immediately use it from TypeScript with full type safety.

For cases where automatic sync doesn't trigger, a manual sync command regenerates the SDK from the current Python code.

### Testing

The project includes both unit tests with Vitest and end-to-end tests with Playwright. Unit tests run in a simulated browser environment and can test individual components or utility functions.

End-to-end tests run against the full application. A setup step logs in and saves the authentication state so subsequent tests don't need to repeat the login flow. Tests can create data, interact with the UI, and verify results.

---

## Production Deployment

### Building

The production build compiles and optimizes all code. Client-side code is bundled and minified. Server-side code is compiled to run on Node.js. The output is a standalone package that can be deployed anywhere Node.js runs.

Feature flags are evaluated at build time, so disabled features are completely removed from the bundle. This is tree-shaking at the feature level, reducing both bundle size and attack surface.

### Docker

A Dockerfile defines a multi-stage build that installs dependencies, builds the application, and creates a minimal production image. The final image contains only the built code and production dependencies, keeping it small.

The container can be deployed to any platform that runs Docker containers: cloud services like AWS, Google Cloud, or Azure; container platforms like Fly.io or Railway; or your own servers.

### Configuration

Production requires different environment variables than development. You need a secure random secret for session encryption, the correct database URL for your production database, and the public URL where the application will be accessed.

The database will need to be migrated before the first deployment and after any schema changes. In production, you would typically use explicit migrations rather than the push command to have better control and the ability to roll back.

---

## Conclusion

This starter project represents a carefully considered set of choices for building business web applications. It prioritizes developer experience and maintainability over abstract perfection. Every piece is included because it solves a real problem in a straightforward way, and everything that could add complexity without clear benefit has been excluded.

The demo application is comprehensive enough to demonstrate all patterns but simple enough to understand quickly. It's meant to be studied, understood, and then replaced with your own application code. The patterns you learn here — co-located logic, progressive enhancement, type-safe data access — will serve you regardless of the specific features you build.

The technology choices will continue to be relevant for years because they're based on proven technologies with long track records. React, PostgreSQL, and HTTP aren't going anywhere. By choosing boring technology, you free yourself to focus on what makes your application valuable rather than fighting with your tools.
