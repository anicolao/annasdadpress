export const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
export const available = (book) => book.status === "Available";
export const availabilityLabel = (book) =>
  available(book) ? "Available now" : "Forthcoming";
export const orderBooks = (books) =>
  [...books].sort((a, b) => Number(available(b)) - Number(available(a)));
export const recommendations = (books) =>
  orderBooks(books.filter((b) => available(b) || !b.concept));
export function catalogSummary(books) {
  const live = books.filter(available).length;
  const upcoming = books.length - live;
  return (
    [live && `${live} available`, upcoming && `${upcoming} forthcoming`]
      .filter(Boolean)
      .join(" / ") || "No titles yet"
  );
}
export const marketplaces = [
  { key: "amazonCa", label: "Amazon.ca", host: "amazon.ca" },
  { key: "amazonCom", label: "Amazon.com", host: "amazon.com" },
];
export const affiliateDisclosure =
  "As an Amazon Associate I earn from qualifying purchases.";
export function amazonLink(value, key, config) {
  if (!value) return null;
  const market = marketplaces.find((m) => m.key === key);
  const parsed = new URL(value);
  if (
    !market ||
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.port ||
    ![market.host, `www.${market.host}`].includes(parsed.hostname)
  )
    throw new Error(`Use a full HTTPS ${market?.label || key} product URL`);
  const tag = config.affiliateTags[key];
  if (tag) parsed.searchParams.set("tag", tag);
  return {
    href: tag ? parsed.href : value,
    affiliate: Boolean(parsed.searchParams.get("tag")),
  };
}
export function validateCatalog(books, config) {
  const slugs = new Set();
  for (const b of books) {
    if (!["Available", "Forthcoming"].includes(b.status))
      throw new Error(`Invalid status for ${b.slug}`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(b.slug) || slugs.has(b.slug))
      throw new Error(`Invalid or duplicate slug: ${b.slug}`);
    slugs.add(b.slug);
    if (!b.author) throw new Error(`Missing author: ${b.slug}`);
    for (const m of marketplaces) amazonLink(b[m.key], m.key, config);
  }
  if (
    config.contactEmail &&
    !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(config.contactEmail)
  )
    throw new Error("Invalid publisher contact email");
}
export function purchaseSection(book, config) {
  const links = marketplaces.flatMap((m) => {
    const target = amazonLink(book[m.key], m.key, config);
    return target ? [{ ...m, ...target }] : [];
  });
  const live = available(book);
  const heading = live ? "Find your copy." : "Coming to your bookshelf.";
  const description = live
    ? links.length
      ? "Choose your Amazon marketplace."
      : "Purchase links will be added here when confirmed."
    : links.length
      ? "This book is forthcoming. View the listing for details."
      : "Purchase links will be added when available.";
  const identifiers = [
    ["ISBN", book.isbn],
    ["ASIN", book.asin],
  ].filter(([, value]) => value);
  return `<div class="purchase"><h2>${heading}</h2><p>${description}</p>${links.length ? `<div class="marketplaces">${links.map((m) => `<a class="button" href="${escapeHtml(m.href)}"${m.affiliate ? ' rel="sponsored"' : ""}>${live ? "Buy on" : "View on"} ${m.label}${m.affiliate ? " (paid link)" : ""}</a>`).join("")}</div>` : ""}${links.some((m) => m.affiliate) ? `<p class="affiliate-disclosure">${affiliateDisclosure}</p>` : ""}${identifiers.length ? `<dl>${identifiers.map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>` : ""}</div>`;
}
