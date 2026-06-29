// SHA-1 hash of a string, uppercase hex (uses the browser's built-in crypto).
async function sha1(message: string): Promise<string> {
  // text to raw bytes
  const bytes = new TextEncoder().encode(message);
  // browser hashes the bytes (SHA-1)
  // crypto.subtle.digest is the browser's built‑in hashing — it runs locally, nothing is sent.
  const digest = await crypto.subtle.digest('SHA-1', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))   // each byte → 2 hex chars
    .join('')
    .toUpperCase();  // final 40-char UPPERCASE hex hash
}

// Returns how many times a password appears in breaches (0 = not found).
export async function getPasswordPwnedCount(password: string): Promise<number> {
  const hash = await sha1(password); // hash in the browser
  // split the hash into a prefix and suffix, so the full hash never leaves the browser.
  const prefix = hash.slice(0, 5); // only these 5 chars leave the browser
  const suffix = hash.slice(5);  // the secret 35 chars, kept in the browser

  // call the HIBP API with the prefix, and check if the suffix is in the returned list.
  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { 'Add-Padding': 'true' }, // adds fake entries so traffic size can't leak info
    // Add-Padding: true pads the response with decoy rows so an eavesdropper can't guess anything from the response length.
  });
  if (!res.ok) throw new Error('Pwned Passwords request failed');

  const text = await res.text();

  // match locally
  for (const line of text.split('\n')) {
    const [hashSuffix, hits] = line.trim().split(':');
    if (hashSuffix && hashSuffix.toUpperCase() === suffix) {
      return parseInt(hits, 10); // found it, return the count
    }
  }
  return 0; // not found
}

export interface Breach {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  DataClasses: string[];
}

// Returns website domains where the email appeared in stealer logs.
// 404 = clean 
export async function getStealerLogsByEmail(email: string): Promise<string[]> {
  const res = await fetch(
    `/api/v3/stealerlogsbyemail/${encodeURIComponent(email)}`,
    { headers: { accept: 'application/json' } },
  );
  if (res.status === 404) return [];                 // 404 = records not found, i.e. clean
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || body.message || `Backend error ${res.status}`);
}

  // On success, parses the response as an array of domain strings, e.g. ["facebook.com", "gmail.com"].
  return (await res.json()) as string[];             // array of domains
}

export async function getBreachesForEmail(email: string): Promise<Breach[]> {
  const res = await fetch(
    // relative url: send it to the same sever that serves this page - Vite dev server
    // --proxy--adds the key and forwards to the backend, which then forwards to HIBP API.
    `/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false&includeUnverified=true`,
    { headers: { accept: 'application/json' } },
  );
  if (res.status === 404) return []; // 404 = no breaches
  if (!res.ok) throw new Error(`Backend error ${res.status}`);
  return (await res.json()) as Breach[];
}
