export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
export type TYPE_PAGE_SIZE_OPTIONS = (typeof PAGE_SIZE_OPTIONS)[number];
