export const ADMIN_WORD = "user";

// Type this sequence anywhere on the Welcome screen (no Enter needed)
// to bring up the visible password box.
export const TRIGGER_SEQUENCE = "A@";

export const INACTIVITY_LOCK_MS = 2 * 60 * 1000; // 2 minutes

// Order of orbs (by id, see KnockOrbs.jsx) to tap on the Welcome screen
// to unlock via the secret knock instead of typing.
export const KNOCK_PATTERN = [1, 3, 2, 4];

// What word the knock pattern "types" once matched correctly -
// can be your ADMIN_WORD, or any vault's real password.
export const KNOCK_TARGET_WORD = "user";

// How long a one-time share link stays valid before it auto-expires,
// even if it's never opened.
export const BURN_LINK_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours