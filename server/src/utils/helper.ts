export const splitName = (username: string) => {
    if (!username || typeof username !== "string") {
        return { firstName: "", lastName: "" };
    }

    const nameParts = username.trim().split(/\s+/);
    const firstName = nameParts.pop() || ""; // Lấy từ cuối làm firstName
    const lastName = nameParts.join(" ") || ""; // Phần còn lại làm lastName

    return { firstName, lastName };
};