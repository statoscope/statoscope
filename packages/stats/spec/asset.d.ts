import { Source } from './source';

export type AssetID = string;
export type Asset = {
  id: AssetID;
  source?: Source;
};
