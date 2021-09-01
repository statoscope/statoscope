export type Item = {
  type: string;
  name: string;
  typicalSpeed: number;
};

export const bytesInMBit = 131_072;

// from chromium
export const TYPE_3G_SLOW = {
  type: '3G',
  name: 'Slow' as const,
  typicalSpeed: 0.38 * bytesInMBit,
};

// from chromium
export const TYPE_3G_FAST = {
  type: '3G',
  name: 'Fast' as const,
  typicalSpeed: 1.37 * bytesInMBit,
};

export const TYPE_GPRS = {
  type: '2G',
  name: 'GPRS' as const,
  typicalSpeed: 0.06 * bytesInMBit,
};
export const TYPE_EDGE = {
  type: '2G',
  name: 'EDGE' as const,
  typicalSpeed: 0.1 * bytesInMBit,
};
export const TYPE_Basic = {
  type: '3G',
  name: 'Basic' as const,
  typicalSpeed: 0.1 * bytesInMBit,
};
export const TYPE_HSPA = {
  type: '3G',
  name: 'HSPA' as const,
  typicalSpeed: 1.5 * bytesInMBit,
};
export const TYPE_HSPA_PLUS = {
  type: '3G',
  name: 'HSPA+' as const,
  typicalSpeed: 4 * bytesInMBit,
};
export const TYPE_DC_HSPA_PLUS = {
  type: '3G',
  name: 'DC-HSPA+' as const,
  typicalSpeed: 8 * bytesInMBit,
};
export const TYPE_LTE_CAT_4 = {
  type: '4G',
  name: 'LTE cat.4' as const,
  typicalSpeed: 15 * bytesInMBit,
};
export const TYPE_LTE_CAT_6 = {
  type: '4G',
  name: 'LTE cat.6' as const,
  typicalSpeed: 30 * bytesInMBit,
};
export const TYPE_LTE_CAT_9 = {
  type: '4G',
  name: 'LTE cat.9' as const,
  typicalSpeed: 45 * bytesInMBit,
};
export const TYPE_LTE_CAT_12 = {
  type: '4G',
  name: 'LTE cat.12' as const,
  typicalSpeed: 60 * bytesInMBit,
};
export const TYPE_5G = {
  type: '5G',
  name: '5G' as const,
  typicalSpeed: 200 * bytesInMBit,
};

export default [
  TYPE_3G_SLOW,
  TYPE_3G_FAST,
  TYPE_GPRS,
  TYPE_EDGE,
  TYPE_Basic,
  TYPE_HSPA,
  TYPE_HSPA_PLUS,
  TYPE_DC_HSPA_PLUS,
  TYPE_LTE_CAT_4,
  TYPE_LTE_CAT_6,
  TYPE_LTE_CAT_9,
  TYPE_LTE_CAT_12,
  TYPE_5G,
] as const;
