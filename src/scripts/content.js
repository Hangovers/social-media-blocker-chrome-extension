// Chrome exposes `chrome`, Firefox/Floorp expose `browser`.
const extApi = globalThis.browser ?? globalThis.chrome;

// Named constant: where blocked navigations go. The target is never taken
// from page content, query params, or any other runtime/user input.
const BLOCK_PAGE_URL = "https://www.google.com/notfound";
const TRUSTED_REDIRECT_HOSTS = new Set(["google.com", "www.google.com"]);

const SOCIAL_MEDIA_WEBSITES = [
  "facebook",
  "twitter",
  "instagram",
  "youtube",
  "linkedin",
  "whatsapp",
  "telegram",
  "tiktok",
];

// Blocking window in minutes; supports windows that cross midnight
// (e.g. 22:00 -> 06:00).
const isInBlockingWindow = ({ startTime, endTime }, now = new Date()) => {
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  const current = now.getHours() * 60 + now.getMinutes();
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  return start <= end
    ? current >= start && current <= end
    : current >= start || current <= end;
};

const isBlockedHost = (hostname, options) => {
  for (const website of SOCIAL_MEDIA_WEBSITES) {
    if (!options[website]) continue;
    if (
      website === "twitter" &&
      (hostname === "x.com" || hostname.endsWith(".x.com"))
    ) {
      return true;
    }
    if (hostname.includes(website)) return true;
  }
  return false;
};

const redirect = () => {
  let target;
  try {
    target = new URL(BLOCK_PAGE_URL);
  } catch {
    return;
  }
  // Only navigate to an explicitly trusted host.
  if (!TRUSTED_REDIRECT_HOSTS.has(target.hostname)) return;
  if (window.location.href === target.href) return;
  window.location.replace(target.href);
};

const blockWebsites = () => {
  extApi.storage.sync.get("socialMediaBlockerOptions", (data) => {
    const options = data.socialMediaBlockerOptions || {};
    if (!options.startTime || !options.endTime) return;
    if (!isInBlockingWindow(options)) return;
    if (isBlockedHost(window.location.hostname, options)) redirect();
  });
};

extApi.storage.onChanged.addListener(() => {
  blockWebsites();
});

// Initial blocking
blockWebsites();
