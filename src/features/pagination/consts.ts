export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const;
export type PageSizeOption = (typeof PAGE_SIZE_OPTIONS)[number];
