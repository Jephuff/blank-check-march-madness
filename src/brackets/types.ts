import { Options } from 'allOptions';

export type Depths = 0 | 1 | 2 | 3 | 4;
export type IncrementDepth<Depth extends Depths> = Depth extends 0
  ? 1
  : Depth extends 1
  ? 2
  : Depth extends 2
  ? 3
  : 4;
export interface Data<Depth extends Depths = Depths> {
  winner?: Options;
  poll?: string;
  options: Depth extends 4
    ? [Options, Options]
    : [Data<IncrementDepth<Depth>>, Data<IncrementDepth<Depth>>];
}
