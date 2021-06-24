export type Item = {
  type: string;
  name: string;
  maxSpeed: number;
  typicalSpeed: number;
};

export const bytesInMBit = 131_072;

export const TYPE_GPRS: Item = {
  type: '2G',
  name: 'GPRS',
  maxSpeed: 0.1 * bytesInMBit,
  typicalSpeed: 0.06 * bytesInMBit,
};
export const TYPE_EDGE: Item = {
  type: '2G',
  name: 'EDGE',
  maxSpeed: 0.3 * bytesInMBit,
  typicalSpeed: 0.1 * bytesInMBit,
};
export const TYPE_Basic: Item = {
  type: '3G',
  name: 'Basic',
  maxSpeed: 0.3 * bytesInMBit,
  typicalSpeed: 0.1 * bytesInMBit,
};
export const TYPE_HSPA: Item = {
  type: '3G',
  name: 'HSPA',
  maxSpeed: 7.2 * bytesInMBit,
  typicalSpeed: 1.5 * bytesInMBit,
};
export const TYPE_HSPA_PLUS: Item = {
  type: '3G',
  name: 'HSPA+',
  maxSpeed: 21 * bytesInMBit,
  typicalSpeed: 4 * bytesInMBit,
};
export const TYPE_DC_HSPA_PLUS: Item = {
  type: '3G',
  name: 'DC-HSPA+',
  maxSpeed: 42 * bytesInMBit,
  typicalSpeed: 8 * bytesInMBit,
};
export const TYPE_LTE_CAT_4: Item = {
  type: '4G',
  name: 'LTE cat.4',
  maxSpeed: 150 * bytesInMBit,
  typicalSpeed: 15 * bytesInMBit,
};
export const TYPE_LTE_CAT_6: Item = {
  type: '4G',
  name: 'LTE cat.6',
  maxSpeed: 300 * bytesInMBit,
  typicalSpeed: 30 * bytesInMBit,
};
export const TYPE_LTE_CAT_9: Item = {
  type: '4G',
  name: 'LTE cat.9',
  maxSpeed: 450 * bytesInMBit,
  typicalSpeed: 45 * bytesInMBit,
};
export const TYPE_LTE_CAT_12: Item = {
  type: '4G',
  name: 'LTE cat.12',
  maxSpeed: 600 * bytesInMBit,
  typicalSpeed: 60 * bytesInMBit,
};
export const TYPE_5G: Item = {
  type: '5G',
  name: '5G',
  maxSpeed: 10_000 * bytesInMBit,
  typicalSpeed: 200 * bytesInMBit,
};

export default [
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
