/**
 * Usernames that can't be claimed because they collide with existing
 * routes or common system words.  Checked at username-set time.
 *
 * Keep this list in sync with any new top-level routes.
 */
const RESERVED_USERNAMES = new Set([
    // existing app routes
    "admin",
    "adminpanel",
    "api",
    "blog",
    "dashboard",
    "signin",
    "signup",
    "login",
    "logout",
    "e",
    "privacy-policy",
    "tos",
    // system / common
    "about",
    "account",
    "app",
    "billing",
    "contact",
    "events",
    "explore",
    "faq",
    "help",
    "home",
    "invite",
    "join",
    "legal",
    "me",
    "new",
    "notifications",
    "profile",
    "search",
    "settings",
    "support",
    "terms",
    "user",
    "users",
    "www",
    // brand
    "natureclub",
    "nature-club",
]);

export function isReservedUsername(username) {
    return RESERVED_USERNAMES.has(username?.toLowerCase?.());
}

export default RESERVED_USERNAMES;
