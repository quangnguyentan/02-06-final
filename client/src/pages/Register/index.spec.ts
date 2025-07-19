import { test, expect } from '@playwright/test';
test.describe('Register Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/auth'); // Đổi lại URL nếu khác
    });
    test('can click register and login', async ({ page }) => {
        await page.getByText(/register/i).click();
    });
    test('renders register form', async ({ page }) => {
        await page.getByText(/register/i).click();
        await expect(page.getByRole('heading', { name: /register/i })).toBeVisible();
        await expect(page.getByPlaceholder('Email')).toBeVisible();
        await expect(page.getByPlaceholder('Password')).toBeVisible();
        await expect(page.getByRole('button', { name: /register/i })).toBeVisible();
        await expect(page.getByText(/login/i)).toBeVisible();
        await expect(page.getByAltText(/facebook/i)).toBeVisible();
        await expect(page.getByAltText(/google/i)).toBeVisible();
    });
    test('can toggle password visibility', async ({ page }) => {
        await page.getByText(/register/i).click();
        await page.getByTestId('toggle-password-icon').click();

    });
    test('register with valid credentials', async ({ page }) => {
        await page.getByText(/register/i).click();
        await page.fill('input[name="email"]', 'phamthanhhien2410@gmail.com');
        await page.fill('input[name="password"]', 'Hien@2003!');
        await page.getByRole('button', { name: /register/i }).click();
    });
});