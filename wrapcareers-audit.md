# Trade Careers Project Audit

## Section 1: Previous Issues (What Broke Before)

### 1. Tailwind CSS / Styling Completely Broken on Vercel
- **What happened:** Dark theme and all Tailwind utility classes were not rendering on the live Vercel deployment, despite working locally.
- **Root cause:** `postcss.config.mjs` was misconfigured for Next.js 16 / Turbopack. It originally used `@tailwindcss/postcss` as a plugin instead of `tailwindcss` and `autoprefixer` directly. Multiple failed fix attempts occurred due to misleading error messages.
- **What the fix was:** The final fix involved importing `tailwindcss` and `autoprefixer` and calling them as functions in the `plugins` array within `postcss.config.mjs`.

### 2. Supabase Runtime Crash ("Application error" / Digest: 2738719454)
- **What happened:** The application compiled successfully on Vercel but crashed at runtime with "Application error: a server-side exception has occurred."
- **Root cause (Primary):** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables were missing from Vercel.
- **Root cause (Secondary):** The Supabase project had no `jobs` table, and the application attempted to query a non-existent table.
- **What the fix was:** Supabase credentials (URL `https://mjebbzndhzzirfhzaqkmf.supabase.co` and anon key) were manually added as environment variables on Vercel. Additionally, `src/utils/supabase/server.ts` was updated to make `createClient` async and await `cookies()` for compatibility with the latest Next.js. The `jobs` table needed to be created in the Supabase project.

### 3. Vercel API Token Permissions
- **What happened:** Automated Vercel deployments resulted in "Not authorized" errors because the API token lacked sufficient permissions to add environment variables.
- **What the fix was:** Izzy had to manually add environment variables through the Vercel dashboard.

### 4. Multiple Rounds of Failed Fixes
- **What happened:** Gilfoyle went through several iterations attempting to fix the PostCSS configuration, leading to incorrect assumptions and requiring multiple commit and redeploy cycles.
- **This is a process issue:** Wasted significant time on misleading error messages and a lack of a clear testing strategy.

## Section 2: Current State (What You See Now)

### 1. Tailwind CSS / Styling
- **In the codebase:** `postcss.config.mjs` is *missing*. The `package.json` lists `tailwindcss`, `@tailwindcss/postcss`, and `autoprefixer` as dependencies. `tailwind.config.ts` appears to be correctly configured for content paths and custom themes.
- **On the live site (wrap-careers.vercel.app):** The site loads and displays content (verified via `web_fetch`). However, due to browser tool unavailability, a visual inspection could not be performed to confirm if the styling (dark theme, Tailwind utility classes) is rendering correctly. The absence of `postcss.config.mjs` is a concern, as the previous fix explicitly involved this file. This suggests either a new, implicit PostCSS handling by Next.js 16/Turbopack, or a potential regression/incomplete fix.

### 2. Supabase Connection and Schema
- **In the codebase:** The `src/utils/supabase/server.ts` file implements `createClient` as an async function and correctly awaits `cookies()`, aligning with the necessary updates for Next.js 16.
- **On the live site/Supabase:** The site appears to load without a fatal "Application error," which *might* indicate the environment variables are set and the initial connection doesn't crash. However, direct verification of the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables on Vercel, and the *existence* of the `jobs` table in the Supabase project, could not be performed from this environment. The `web_fetch` output showed "No featured jobs available" and "No recent jobs available", which could mean the Supabase connection is working but there's no data, or there's still an issue preventing data retrieval.

### 3. Vercel API Token Permissions
- **Current Status:** Cannot be directly checked from this environment. This requires access to Vercel deployment logs or configuration.

### 4. Code Quality and Build Process
- **Local Build:** `npm install` completed with high severity vulnerabilities (but no critical errors preventing installation). `npm run build` completed successfully without any compilation errors, indicating a healthy build process for the application itself.

## Section 3: Game Plan (How to Fix Everything)

The goal is to get the Trade Careers site to a clean working state, ensuring all previous issues are resolved and new ones are addressed.

1.  **Verify Tailwind CSS / Styling on Live Site (Manual Visual Check):**
    *   **Action:** Manually open `wrap-careers.vercel.app` in a web browser.
    *   **Check:**
        *   Does the dark theme render correctly?
        *   Are all Tailwind utility classes applied as expected?
        *   Are there any visible styling inconsistencies or broken layouts?
        *   Check browser console for CSS-related errors or warnings.
    *   **Rationale:** Visual confirmation is essential to ensure the styling issue is truly fixed, given the missing `postcss.config.mjs`.

2.  **Investigate `postcss.config.mjs`:**
    *   **Action:** If styling issues are confirmed on the live site, create a `postcss.config.mjs` file in the project root with the previously identified fix:
        ```javascript
        // postcss.config.mjs
        import tailwindcss from 'tailwindcss';
        import autoprefixer from 'autoprefixer';

        export default {
          plugins: {
            tailwindcss: {},
            autoprefixer: {},
          },
        };
        ```
        (Note: The original fix mentioned calling them as functions directly in the array, so it might be `plugins: [tailwindcss(), autoprefixer()]` depending on the exact PostCSS version and how Next.js integrates. The above is a common Next.js 16 config with object shorthand.)
    *   **Rationale:** The absence of this file is suspicious given the previous fix involved it. Adding it back or ensuring Next.js is implicitly handling it correctly is crucial for Tailwind.

3.  **Verify Supabase Environment Variables and Database Schema:**
    *   **Action:**
        *   Access the Vercel project settings for `wrap-careers`.
        *   Verify that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correctly set with the provided values (`https://mjebbzndhzzirfhzaqkmf.supabase.co` for URL).
        *   Access the Supabase project console (for `mjebbzndhzzirfhzaqkmf`).
        *   Navigate to the "Table Editor" or "Database" section.
        *   Confirm that a `jobs` table exists and has the expected schema (e.g., columns for job title, description, etc.).
    *   **Rationale:** This directly addresses the two root causes of the Supabase runtime crash.

4.  **Address `npm audit` vulnerabilities:**
    *   **Action:** Run `npm audit fix` locally. If `--force` is recommended, evaluate the breaking changes carefully before applying.
    *   **Rationale:** While not blocking the build, high severity vulnerabilities should be addressed for security and stability.

5.  **Review and Test `src/app/api` Endpoints:**
    *   **Action:** Once the site is loading correctly and Supabase is verified, test the API endpoints (`/api/geocode`, `/api/installers`, `/api/installers/[slug]`, `/api/jobs`, `/api/jobs/[slug]`, `/api/jobs/[slug]/apply`, `/api/upload`) using `curl` or a tool like Postman/Insomnia.
    *   **Check:** Ensure they return expected data and handle errors gracefully.
    *   **Rationale:** To confirm backend functionality and data flow.

6.  **Comprehensive Link and Page Navigation Test:**
    *   **Action:** Manually navigate through all pages of the live site (home, jobs list, individual job pages, post a job, installers, etc.).
    *   **Check:**
        *   Are all links working and leading to the correct pages?
        *   Are there any 404 errors or broken routes?
        *   Check the browser console for any JavaScript errors.
    *   **Rationale:** To identify any new or overlooked navigation or rendering issues.

### Testing Strategy to Avoid Blind Deploys:

To prevent a recurrence of the "multiple rounds of failed fixes" and "blind deploy" cycle, the following testing strategy should be implemented:

1.  **Local Development Environment Setup:**
    *   Ensure a consistent local development environment is set up for all contributors.
    *   Use `npm run dev` to test changes locally before committing.

2.  **Dedicated Staging Environment (if possible):**
    *   If feasible, set up a dedicated staging environment (e.g., a separate Vercel project or branch deployment) where new features and fixes can be deployed and thoroughly tested *before* merging to `main` and deploying to production.

3.  **Unit and Integration Tests (Introduce Incrementally):**
    *   **Action:** Start by adding basic unit tests for critical utility functions (e.g., Supabase client initialization, data fetching functions).
    *   **Action:** Introduce integration tests for API endpoints (`/api/*`) to verify data responses and error handling.
    *   **Rationale:** Automated tests catch regressions early and reduce reliance on manual testing.

4.  **End-to-End (E2E) Testing (Consider Playwright/Cypress):**
    *   **Action:** For critical user flows (e.g., viewing jobs, posting a job, applying), consider implementing E2E tests using tools like Playwright or Cypress.
    *   **Rationale:** E2E tests simulate user interactions on the actual rendered application, catching UI and integration issues that unit/integration tests might miss.

5.  **Vercel Preview Deployments:**
    *   **Action:** Leverage Vercel's preview deployment feature for every pull request.
    *   **Process:** Each pull request should trigger a unique Vercel deployment URL. Reviewers and testers can then test changes directly on this preview environment before merging.
    *   **Rationale:** Provides a shareable, isolated environment for testing changes in a production-like setting without affecting the live site.

6.  **Clear Communication and Documentation:**
    *   **Action:** Document the testing strategy and expected testing steps for each type of change (bug fix, feature, etc.).
    *   **Action:** For each pull request, clearly articulate what was changed and what needs to be tested.
    *   **Rationale:** Ensures everyone is aligned on testing procedures and responsibilities.

7.  **Post-Deployment Smoke Tests:**
    *   **Action:** After *every* production deployment, perform a quick "smoke test" — a small set of essential manual checks (e.g., homepage loads, key links work, basic styling is present) to quickly confirm the site is functional.
    *   **Rationale:** Catches critical deployment-related issues immediately.
