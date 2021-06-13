export type Size = {
  compressor?: string;
  size: number;
};

export type Source = {
  content?: string;
  sizes: Size[];
};
