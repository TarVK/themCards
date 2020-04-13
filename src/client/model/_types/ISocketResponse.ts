export type ISocketResponse<T extends Object = {}> =
    | {
          errorMessage: string;
          errorID: number;
          success: false;
      }
    | ({success: true} & T);
