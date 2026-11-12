import { isMockMode } from "./scenario";

export async function enableMocking() {
  if (!isMockMode()) return;
  const { worker } = await import("./browser");
  await worker.start({
    onUnhandledFrame: "bypass",
    serviceWorker: { url: "/mockServiceWorker.js" },
  });
}
