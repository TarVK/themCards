/**
 * Executes the given function and returns its result or an error code if an error occurred
 * @param func The function to execute
 * @returns The result of the function, or a generic error code
 */
export const withErrorHandling = (func: () => any) => {
    try {
        return func();
    } catch (e) {
        return {
            errorMessage: "An unexpected error occurred",
            errorCode: -1000,
            error: e.toString(),
        };
    }
};
