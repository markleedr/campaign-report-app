# AdProof App - Owner's Guide

## What Is This App?

AdProof is a web application that helps you create, manage, and share advertising proofs with clients. Think of it as a digital workspace where you can:
- Manage multiple clients
- Create advertising campaigns for each client
- Build different types of ads (single ads, carousel ads, Performance Max campaigns)
- Share ad proofs with clients for approval
- Track versions and feedback

---

## How the App Is Structured

### The Big Picture

Your app is organized like a house with different rooms:

```
AdProof App
├── Front Door (Landing/Login)
├── Main Dashboard (Your workspace)
├── Campaign Rooms (One for each campaign)
└── Ad Builders (Tools to create ads)
```

### Key Folders Explained

#### 📁 **src/pages/** - The Main Screens
This is where all the different "pages" or screens of your app live. Each file is a complete page that users can visit.

**Important files you might want to edit:**

- **`Auth.tsx`** - The login and sign-up page
  - *Change this if you want to modify the text on the login screen*
  - Contains the email/password forms
  - Controls what happens when someone signs up or logs in

- **`Dashboard.tsx`** - The main dashboard after login
  - *This is the first screen users see after logging in*
  - Shows the list of clients and campaigns
  - Contains text like "Dashboard" and "Manage your clients and ad proofs"

- **`Index.tsx`** - The landing page (redirects to login)
  - *This is the very first page when someone visits your site*
  - Currently just redirects users to login or dashboard
  - If you want a marketing landing page, you'd build it here

- **`AdBuilder.tsx`** - Tool for creating single image ads
- **`CarouselBuilder.tsx`** - Tool for creating carousel ads (multiple images)
- **`PerformanceMaxBuilder.tsx`** - Tool for creating Google Performance Max campaigns
- **`CampaignDetail.tsx`** - Shows details of a specific campaign
- **`ProofView.tsx`** - What clients see when you share an ad proof with them

#### 📁 **src/components/** - Reusable Building Blocks
These are like LEGO pieces that you use throughout the app. Instead of rebuilding the same button or form everywhere, you create it once here and reuse it.

**Important components:**

- **`Navigation.tsx`** - The top navigation bar
  - *Edit this to change the menu items or logo*
  - Appears on every page after login

- **`AddClientDialog.tsx`** - The popup form for adding new clients
- **`CreateCampaignDialog.tsx`** - The popup form for creating campaigns
- **`ProtectedRoute.tsx`** - Security guard that checks if users are logged in

#### 📁 **src/integrations/supabase/** - Database Connection
This is where your app talks to the database (Supabase).

**Key files:**

- **`client.ts`** - The connection to your database
  - *Contains your database URL and security keys*
  - **⚠️ Don't edit this unless you know what you're doing**

- **`types.ts`** - Defines what your database tables look like
  - Automatically generated from your database structure
  - Helps prevent errors when saving/loading data

#### 📁 **src/App.tsx** - The Traffic Controller
This file controls which page shows up when someone visits a URL.

For example:
- `/` → Landing page
- `/auth` → Login page
- `/dashboard` → Main dashboard
- `/campaign/123` → Campaign details for campaign #123

*Edit this file if you want to add new pages or change URLs*

#### 📁 **public/** - Static Files
Images, logos, and other files that don't change. Put your company logo here.

---

## Common Tasks - Where to Make Changes

### ✏️ "I want to change the text on the login page"
**File to edit:** `src/pages/Auth.tsx`

Look for lines like:
```typescript
<CardTitle>{isLogin ? "Sign In" : "Sign Up"}</CardTitle>
<CardDescription>
  {isLogin
    ? "Enter your credentials to access your account"
    : "Create an account to get started"}
</CardDescription>
```

### ✏️ "I want to change the dashboard welcome message"
**File to edit:** `src/pages/Dashboard.tsx`

Look for lines like:
```typescript
<h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
<p className="text-sm sm:text-base text-muted-foreground">Manage your clients and ad proofs</p>
```

### ✏️ "I want to add a new menu item to the navigation"
**File to edit:** `src/components/Navigation.tsx`

This file controls the top menu bar that appears on every page.

### ✏️ "I want to change the app colors or styling"
**Files to edit:**
- `src/index.css` - Global styles and color themes
- `tailwind.config.ts` - Color palette and design system

### ✏️ "I want to add a new page to the app"
You need to:
1. Create a new file in `src/pages/` (e.g., `MyNewPage.tsx`)
2. Add a route in `src/App.tsx` to make it accessible

---

## Database Logic - How Data Is Saved and Loaded

### Where Database Queries Happen

**Every page that loads or saves data uses this pattern:**

```typescript
// Example from Dashboard.tsx
const { data: clients } = useQuery({
  queryKey: ["clients"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("name");
    
    if (error) throw error;
    return data;
  },
});
```

**What this means in plain English:**
- `supabase.from("clients")` - Talk to the "clients" table in the database
- `.select("*")` - Get all the information
- `.order("name")` - Sort by name
- The data gets stored in the `clients` variable

### Database Tables (Your Data Structure)

Your app uses these main tables:

1. **clients** - Stores client information (name, contact info)
2. **campaigns** - Stores campaigns (linked to clients)
3. **ad_proofs** - Stores individual ads (linked to campaigns)
4. **ad_proof_versions** - Stores different versions of ads (for tracking changes)

### Where to Find Database Logic

**Loading data (reading from database):**
- Look for `useQuery` in any page file
- Example: `Dashboard.tsx` loads clients and campaigns

**Saving data (writing to database):**
- Look for `useMutation` in any page file
- Example: `AdBuilder.tsx` saves new ads
- Example: `AddClientDialog.tsx` saves new clients

**Database connection settings:**
- File: `src/integrations/supabase/client.ts`
- Contains your database URL and API key
- **⚠️ Keep this file secure - it has your database credentials**

---

## Environment Variables (Secret Settings)

**File:** `.env`

This file contains sensitive information like:
- Database URL
- API keys
- Security tokens

**⚠️ Never share this file publicly or commit it to GitHub**

---

## How Users Flow Through the App

1. **User visits the site** → `Index.tsx` (landing page)
2. **Redirected to login** → `Auth.tsx` (if not logged in)
3. **After login** → `Dashboard.tsx` (main workspace)
4. **Click on a campaign** → `CampaignDetail.tsx` (campaign details)
5. **Create a new ad** → `AdBuilder.tsx`, `CarouselBuilder.tsx`, or `PerformanceMaxBuilder.tsx`
6. **Share with client** → Client receives link to `ProofView.tsx`

---

## Testing Your App

**File:** `tests/homepage.spec.ts`

This file contains automated tests that check if your app is working correctly.

**Run tests with:**
```bash
npm test
```

**What it tests:**
- Login page loads correctly
- Sign-up form is visible
- Navigation buttons work

---

## Quick Reference - File Locations

| What You Want to Change | File to Edit |
|------------------------|--------------|
| Login page text | `src/pages/Auth.tsx` |
| Dashboard text | `src/pages/Dashboard.tsx` |
| Navigation menu | `src/components/Navigation.tsx` |
| App colors/theme | `src/index.css` or `tailwind.config.ts` |
| Database connection | `src/integrations/supabase/client.ts` |
| Page URLs/routes | `src/App.tsx` |
| Company logo | `public/` folder |

---

## Getting Help

### Understanding the Code

- **`.tsx` files** - These are React components (pages and UI elements)
- **`className=`** - This is how we style elements (using Tailwind CSS)
- **`const`** - Declares a variable (a piece of data)
- **`async/await`** - Used when talking to the database (waiting for data)

### Common Patterns You'll See

**Showing data:**
```typescript
{clients?.map((client) => (
  <div>{client.name}</div>
))}
```
*This loops through all clients and displays each name*

**Handling button clicks:**
```typescript
onClick={() => setAddClientOpen(true)}
```
*When button is clicked, open the "add client" dialog*

**Loading data from database:**
```typescript
const { data, error } = await supabase.from("clients").select("*");
```
*Get all clients from the database*

---

## Important Notes

### Security
- Never share your `.env` file
- Never commit database credentials to GitHub
- The `ProtectedRoute.tsx` component ensures users must be logged in to see certain pages

### Making Changes Safely
1. Always test changes locally first (`npm run dev`)
2. Run tests before deploying (`npm test`)
3. Keep backups of files before making major changes
4. Use Git to track changes (you can always undo)

### Need to Add Features?
- New page? → Create file in `src/pages/` and add route in `src/App.tsx`
- New database table? → Update in Supabase dashboard, then update `src/integrations/supabase/types.ts`
- New form field? → Edit the relevant component in `src/components/` or page in `src/pages/`

---

## Tech Stack (What Powers This App)

- **React** - Builds the user interface
- **TypeScript** - Adds type safety to JavaScript
- **Vite** - Development server and build tool
- **Supabase** - Database and authentication
- **Tailwind CSS** - Styling framework
- **shadcn/ui** - Pre-built UI components
- **Playwright** - Automated testing

---

## Questions?

If you're unsure about something:
1. Check this guide first
2. Look at similar code in other files
3. Test changes in development mode (`npm run dev`)
4. Consult with your developer

Remember: It's okay to experiment in development mode - you can always undo changes with Git!
