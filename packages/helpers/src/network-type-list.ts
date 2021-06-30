export type Item = {
  type: string;
  name: string;
  typicalSpeed: number;
};

export const bytesInMBit = 131_072;

// from chromium
export const TYPE_3G_SLOW = {
  type: '3G',
  name: 'Slow',
  typicalSpeed: 0.38 * bytesInMBit,
};

// from chromium
export const TYPE_3G_FAST = {
  type: '3G',
  name: 'Fast',
  typicalSpeed: 1.37 * bytesInMBit,
};

export const TYPE_GPRS: Item = {
  type: '2G',
  name: 'GPRS',
  typicalSpeed: 0.06 * bytesInMBit,
};
export const TYPE_EDGE: Item = {
  type: '2G',
  name: 'EDGE',
  typicalSpeed: 0.1 * bytesInMBit,
};
export const TYPE_Basic: Item = {
  type: '3G',
  name: 'Basic',
  typicalSpeed: 0.1 * bytesInMBit,
};
export const TYPE_HSPA: Item = {
  type: '3G',
  name: 'HSPA',
  typicalSpeed: 1.5 * bytesInMBit,
};
export const TYPE_HSPA_PLUS: Item = {
  type: '3G',
  name: 'HSPA+',
  typicalSpeed: 4 * bytesInMBit,
};
export const TYPE_DC_HSPA_PLUS: Item = {
  type: '3G',
  name: 'DC-HSPA+',
  typicalSpeed: 8 * bytesInMBit,
};
export const TYPE_LTE_CAT_4: Item = {
  type: '4G',
  name: 'LTE cat.4',
  typicalSpeed: 15 * bytesInMBit,
};
export const TYPE_LTE_CAT_6: Item = {
  type: '4G',
  name: 'LTE cat.6',
  typicalSpeed: 30 * bytesInMBit,
};
export const TYPE_LTE_CAT_9: Item = {
  type: '4G',
  name: 'LTE cat.9',
  typicalSpeed: 45 * bytesInMBit,
};
export const TYPE_LTE_CAT_12: Item = {
  type: '4G',
  name: 'LTE cat.12',
  typicalSpeed: 60 * bytesInMBit,
};
export const TYPE_5G: Item = {
  type: '5G',
  name: '5G',
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
] as Item[];
