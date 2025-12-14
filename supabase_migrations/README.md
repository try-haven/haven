# Supabase Database Migrations

This folder contains SQL migration scripts for your Supabase database.

## How to Apply Migrations

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of the migration file
5. Run the query

## Available Migrations

### delete_user_function.sql

Creates a database function that allows users to delete their own account.

**What it does:**
- Creates a `delete_user()` function that authenticated users can call
- Uses `SECURITY DEFINER` to grant the function elevated privileges needed to delete auth users
- Only allows users to delete their own account (uses `auth.uid()` to ensure this)

**When to run:**
Run this migration to enable the "Delete Account" feature on the profile page.

**Note:** Without this migration, the delete account feature will still work partially - it will delete all user data from the database tables (liked listings, reviews, profile) but the auth user record will remain.
