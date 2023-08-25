/**
 * Dynamically load a package and print an error if it is not installed.
 * `loaderFn` is used to increase compatibility with bundlers.
 */
export const loadPackage = <T>(packageName: string, loaderFn: () => T): T => {
  try {
    return loaderFn();
  } catch (error: any) {
    if (error.code === "MODULE_NOT_FOUND") {
      throw new Error(`Could not find "${packageName}" which is necessary for optional features. Did you install it?`);
    }

    throw error;
  }
};
