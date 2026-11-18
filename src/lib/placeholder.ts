/**
 * TEMPORARY BACKEND SHIM
 * ----------------------
 * The Express API is not built yet. Every mutation in the UI calls
 * `simulateRequest()` instead of hitting the network so the whole flow can be
 * exercised end-to-end with local state only.
 *
 * TODO: Connect API — at each call site, replace `await simulateRequest()`
 * with the real request (the endpoint is documented above the call).
 */
export async function simulateRequest(delayMs = 450): Promise<true> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return true;
}
