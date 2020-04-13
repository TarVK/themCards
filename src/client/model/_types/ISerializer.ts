export type ISerializer<I, D> = {
    serialize: (item: I) => D;
    deserialize: (data: D) => I;
};
