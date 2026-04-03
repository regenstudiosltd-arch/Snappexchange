export const GROUP_RULES = [
  'Contributions must be made on time to ensure rotation integrity.',
  'Payouts follow the system-generated rotation schedule.',
  'Missing multiple contributions may lead to administrative removal.',
] as const;

export const STALE_TIME_MS = 5 * 60 * 1000;
export const SEARCH_DEBOUNCE_MS = 300;
