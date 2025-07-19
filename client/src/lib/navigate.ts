let navigateFunction: (path: string) => void;

export const setNavigate = (navigate: (path: string) => void) => {
    navigateFunction = navigate;
};

export const navigate = (path: string) => {
    if (navigateFunction) {
        navigateFunction(path);
    } else {
        console.error("Navigate function not initialized yet.");
    }
};