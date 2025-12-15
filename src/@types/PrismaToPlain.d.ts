type ReplaceDecimalWithNumber<T> = {
  [K in keyof T]: T[K] extends Decimal | null
    ? number | null
    : T[K] extends Decimal
    ? number
    : T[K];
};

export type PrismaToPlain<T> = ReplaceDecimalWithNumber<T>;
