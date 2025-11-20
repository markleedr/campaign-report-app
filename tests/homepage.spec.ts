import { test, expect } from '@playwright/test';

test.describe('Homepage Tests', () => {
    test('should load the homepage and redirect to auth', async ({ page }) => {
        // Navigate to the homepage
        await page.goto('/');

        // Wait for redirect to /auth
        await page.waitForURL('**/auth');

        // Verify we're on the auth page
        expect(page.url()).toContain('/auth');
    });

    test('should display the Sign Up form', async ({ page }) => {
        // Navigate to the auth page
        await page.goto('/auth');

        // Check that the Sign In title is visible (default state)
        await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();

        // Click the "Don't have an account? Sign up" button to switch to Sign Up
        await page.getByRole('button', { name: /Don't have an account\? Sign up/i }).click();

        // Check that the Sign Up title is now visible
        await expect(page.getByRole('heading', { name: 'Sign Up' })).toBeVisible();

        // Verify the form description
        await expect(page.getByText('Create an account to get started')).toBeVisible();

        // Verify form fields are present
        await expect(page.getByLabel('Email')).toBeVisible();
        await expect(page.getByLabel('Password')).toBeVisible();

        // Verify the Sign Up button is present
        await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
    });

    test('should have navigation elements on auth page', async ({ page }) => {
        // Navigate to the auth page
        await page.goto('/auth');

        // Verify the toggle button exists to switch between Sign In and Sign Up
        await expect(page.getByRole('button', { name: /Don't have an account\? Sign up/i })).toBeVisible();

        // Switch to Sign Up mode
        await page.getByRole('button', { name: /Don't have an account\? Sign up/i }).click();

        // Verify the toggle button now shows "Already have an account? Sign in"
        await expect(page.getByRole('button', { name: /Already have an account\? Sign in/i })).toBeVisible();
    });

    test('should have email and password inputs with proper attributes', async ({ page }) => {
        // Navigate to the auth page
        await page.goto('/auth');

        // Check email input
        const emailInput = page.getByLabel('Email');
        await expect(emailInput).toBeVisible();
        await expect(emailInput).toHaveAttribute('type', 'email');
        await expect(emailInput).toHaveAttribute('required', '');

        // Check password input
        const passwordInput = page.getByLabel('Password');
        await expect(passwordInput).toBeVisible();
        await expect(passwordInput).toHaveAttribute('type', 'password');
        await expect(passwordInput).toHaveAttribute('required', '');
    });
});
