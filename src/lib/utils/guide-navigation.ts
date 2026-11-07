const topics = ["encyclopedia", "milestone", "activities", "babyfood", "sleep", "feeding", "dental", "health"];

/** Accept only an encyclopedia context owned by this app, never an external URL. */
export function guideReturnHref(value: string | null): string | undefined {
  if (!value || value.length > 1200) return undefined;
  try {
    const url = new URL(value, "https://infantpedia.local");
    if (url.origin !== "https://infantpedia.local" || url.pathname !== "/encyclopedia" || !value.startsWith("/encyclopedia")) return undefined;
    const tab = url.searchParams.get("tab");
    const month = url.searchParams.get("month");
    if (!tab || !topics.includes(tab) || !month || !/^(?:[0-9]|1[0-2])$/.test(month)) return undefined;
    const params = new URLSearchParams({ tab, month });
    const entry = url.searchParams.get("entry");
    if (entry && /^\d{1,12}$/.test(entry)) params.set("entry", entry);
    return `/encyclopedia?${params}`;
  } catch { return undefined; }
}
