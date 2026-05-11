# Chapter 6: System Testing & Execution

Software testing is critical to ensure the reliability and security of the Localfluence platform. Given the decoupled nature of the application, testing is divided into distinct phases.

## 6.1 Testing Strategies

### 6.1.1 Unit Testing
Unit tests isolate individual functions and components to ensure they execute as expected given specific inputs. 
- **Backend**: We test individual utility functions, such as password hashing routines, independently of the Express routing logic.
- **Frontend**: We test complex custom React hooks and utility functions (like date formatters) using Jest or Vitest.

### 6.1.2 API Testing (Integration Testing)
Integration tests verify that different modules communicate correctly. The primary focus here is the Express API endpoints.
- **Strategy**: We execute HTTP requests against a local instance of the server and assert the response codes and payload structures.

### 6.1.3 End-to-End (E2E) System Testing
E2E tests simulate actual user behavior from the browser level down to the database layer.
- **Scenario**: A user logs in as a Business, navigates to the 'Create Campaign' page, fills out the form, submits it, and verifies the new campaign appears on their dashboard.

## 6.2 Test Cases & Execution Summary

The following table outlines a sample of the core test cases executed during the Quality Assurance phase.

| Test Case ID | Module | Pre-condition | Action / Steps | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-001** | Authentication | User is on login screen. | Enter incorrect password for a valid email. | API returns `401 Unauthorized`. UI shows toast "Invalid Credentials". | API returns `401`. Toast appears. | **PASS** |
| **TC-002** | Campaign Mgmt | Business is authenticated. | Submit new campaign form with empty `Title`. | Zod validates fails client-side. Input boundary turns red. | Request blocked. UI shows validation error. | **PASS** |
| **TC-003** | Database Integrity | Influencer views a deleted campaign. | Influencer attempts to send request to deleted campaign ID. | API returns `400 Bad Request` or `404 Not Found`. Foreign key cascade handles deletion safely. | API returns 404. UI returns to feed. | **PASS** |
| **TC-004** | Role Based Access | Influencer is authenticated. | Influencer attempts a POST request to `/api/campaigns`. | API returns `403 Forbidden` due to RBAC middleware check. | API returns 403. | **PASS** |

## 6.3 Local Deployment & Setup Instructions
To execute the application locally, follow these steps:

1. **Clone the Repository** and navigate to the project root.
2. **Install Dependencies**: Execute `pnpm install` at the root level to resolve workspace packages.
3. **Database Initialization**: 
   - Navigate to `lib/db`.
   - Run `pnpm run push` to generate the SQLite file (`localfluence.db`) and synchronize the Drizzle schema.
4. **Start the API Server**:
   - Navigate to `artifacts/api-server`.
   - Run `pnpm run dev`. The server will bind to `localhost:5000`.
5. **Start the Frontend Client**:
   - Navigate to `artifacts/localfluence`.
   - Run `pnpm run dev`. The Vite server will spin up on `localhost:5173`.
6. **Access**: Open a modern web browser and navigate to `http://localhost:5173`.

---

# Chapter 7: Conclusion & Future Scope

## 7.1 Conclusion
The Localfluence project successfully demonstrates the viability of a hyperlocal marketplace tailored for micro-creators and local businesses. By implementing a modern Monorepo architecture with React, Express, and SQLite via Drizzle ORM, the platform delivers a highly responsive, type-safe, and secure user experience. The application successfully fulfills its core objectives: enabling location-based creator discovery, streamlining campaign creation, and providing a unified dashboard for managing collaboration requests and messaging. 

## 7.2 Limitations
While functional as an MVP (Minimum Viable Product), the current iteration has several constraints:
1. **Local File Persistence**: The use of SQLite is excellent for development but lacks the concurrency scaling required for a massive production user base compared to PostgreSQL.
2. **Missing Media Integrations**: Users must manually input their follower statistics. The platform does not currently pull verified data directly via the Instagram Graph API or TikTok API.
3. **No Integrated Escrow/Payments**: Collaborators must settle financial transactions off-platform, reducing the monetization potential for the platform itself.

## 7.3 Future Enhancements
To evolve Localfluence into a commercial SaaS product, the following enhancements are proposed:
- **OAuth 2.0 Integration**: Allow users to 'Sign in with Instagram' or 'Sign in with Google' to reduce onboarding friction and auto-verify social media metrics.
- **Stripe Connect Integration**: Implement an escrow payment system where businesses deposit funds upon accepting a request, which are released to the influencer upon milestone completion.
- **Geospatial Queries (PostGIS)**: Migrate from SQLite to PostgreSQL with PostGIS to enable complex radius-based queries (e.g., "Find influencers within exactly 5 miles of this coordinate").

---

# Appendix

## A. API Endpoint Reference Table

The following table acts as a quick reference guide for the RESTful endpoints exposed by the API server.

| HTTP Method | Endpoint | Description | Auth Required | Target Role |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new user and issue JWT. | No | Any |
| `POST` | `/api/auth/login` | Authenticate user and issue JWT. | No | Any |
| `GET` | `/api/auth/me` | Retrieve current authenticated user profile. | Yes | Any |
| `GET` | `/api/campaigns` | Fetch paginated list of campaigns. | Yes | Influencer |
| `POST` | `/api/campaigns` | Create a new campaign. | Yes | Business |
| `GET` | `/api/influencers` | Fetch list of influencers based on filters. | Yes | Business |
| `POST` | `/api/requests` | Submit an application for a collaboration. | Yes | Influencer |
| `PATCH` | `/api/requests/:id` | Accept/Reject an application. | Yes | Business |
| `GET` | `/api/messages/:userId` | Retrieve chat history with a specific user. | Yes | Any |


## B. Core Configuration Files

### `vite.config.ts` (Frontend configuration proxying API requests)
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
```

### `drizzle.config.ts` (Database Migration Config)
```typescript
import { defineConfig } from "vite"; // Note: actually uses "drizzle-kit"
import { defineConfig } from "drizzle-kit";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "../../localfluence.db");

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL || `file:${dbPath}`,
  },
});
```

## C. Glossary of Terms
- **API (Application Programming Interface)**: A set of protocols for building and integrating application software.
- **JWT (JSON Web Token)**: An open standard used to share security information between a client and a server.
- **ORM (Object-Relational Mapping)**: A programming technique for converting data between incompatible type systems using object-oriented programming languages.
- **Monorepo**: A software development strategy where code for many projects is stored in the same repository.
- **Hyperlocal**: Information oriented around a well-defined community with its primary focus directed toward the concerns of the population in that community.
- **SPA (Single Page Application)**: A web application that interacts with the user by dynamically rewriting the current web page with new data from the web server, instead of the default method of a web browser loading entire new pages.
