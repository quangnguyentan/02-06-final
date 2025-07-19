import { test, expect } from '@playwright/test';
test.beforeEach(async ({ context }) => {
    // Xóa toàn bộ cookies, localStorage, sessionStorage
    await context.clearCookies();
    await context.clearPermissions();
    // Nếu muốn xóa storage của từng trang:
    // for (const page of context.pages()) {
    //   await page.goto('about:blank');
    //   await page.evaluate(() => {
    //     localStorage.clear();
    //     sessionStorage.clear();
    //   });
    // }
});
test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:5173/auth'); // Đổi lại URL nếu khác
    });

    test('renders login form', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
        await expect(page.getByPlaceholder('Email')).toBeVisible();
        await expect(page.getByPlaceholder('Password')).toBeVisible();
        await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
        await expect(page.getByText(/register/i)).toBeVisible();
        await expect(page.getByAltText(/facebook/i)).toBeVisible();
        await expect(page.getByAltText(/google/i)).toBeVisible();
    });

    test('shows error if fields are empty', async ({ page }) => {
        await page.getByRole('button', { name: /login/i }).click();
        // Giả sử có toast báo lỗi, kiểm tra text xuất hiện
        await expect(page.getByText(/please fill in all fields/i)).toBeVisible();
    });

    test('can toggle password visibility', async ({ page }) => {
        // Giả sử có data-testid="toggle-password-icon" trên icon
        await page.getByTestId('toggle-password-icon').click();
        // Có thể kiểm tra type input đổi từ password sang text nếu có
        // expect(await page.getByPlaceholder('Password').getAttribute('type')).toBe('text');
    });

    test('can click register and login', async ({ page }) => {
        await page.getByText(/register/i).click();
        // Kiểm tra điều hướng hoặc modal xuất hiện nếu có
        // await expect(page).toHaveURL(/register/);
        await page.getByText(/login/i).click();
        // await page.goto('http://localhost:5173/auth'); 
        // await page.getByText(/forgot password\?/i).click();
        // Kiểm tra điều hướng hoặc modal xuất hiện nếu có
        // await expect(page).toHaveURL(/forgot-password/);
    });

    // Thêm test đăng nhập thành công / thất bại nếu có API mock hoặc test account
    test('login with valid credentials', async ({ page }) => {
        await page.fill('input[name="email"]', 'tanquanga6k88@gmail.com');
        await page.fill('input[name="password"]', 'Quang@123');
        await page.getByTestId('toggle-password-icon').click();
        await page.getByRole('button', { name: /login/i }).click();
        // Kiểm tra điều hướng hoặc thông báo thành công
        await expect(page).toHaveURL('http://localhost:5173/');
        await page.goto('http://localhost:5173/');
    });
    test('login with invalid credentials', async ({ page }) => {
        await page.fill('input[name="email"]', 'phamthanhhien2003@gmail.com');
        await page.fill('input[name="password"]', 'quang123');
        await page.getByTestId('toggle-password-icon').click();
        await page.getByRole('button', { name: /login/i }).click();
        // Kiểm tra điều hướng hoặc thông báo thành công
        await expect(page.getByText(/incorrect email or password/i)).toBeVisible();

    });
    test('login admin with valid credentials', async ({ page }) => {
        await page.fill('input[name="email"]', 'admin@gmail.com');
        await page.fill('input[name="password"]', 'Admin123@');
        await page.getByTestId('toggle-password-icon').click();
        await page.getByRole('button', { name: /login/i }).click();
        // Kiểm tra điều hướng hoặc thông báo thành công
        await expect(page).toHaveURL('http://localhost:5173/');
        await page.goto('http://localhost:5173/');
    });
    test('login admin with invalid credentials', async ({ page }) => {
        await page.fill('input[name="email"]', 'admin@gmail.com');
        await page.fill('input[name="password"]', 'quang123');
        await page.getByTestId('toggle-password-icon').click();
        await page.getByRole('button', { name: /login/i }).click();
        // Kiểm tra điều hướng hoặc thông báo thành công
        await expect(page.getByText(/incorrect email or password/i)).toBeVisible();

    });
});