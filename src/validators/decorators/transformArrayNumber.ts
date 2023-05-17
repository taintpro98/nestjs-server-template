import { Transform } from 'class-transformer';

export function TransformArrayNumber() {
  function transformArrNumber({ value }) {
    if (typeof value == 'string') {
      return value
        .trim()
        .split(',')
        .filter((val: any) => val !== '')
        .map((val: any) => Number(val));
    } else {
      return value;
    }
  }

  return Transform(transformArrNumber);
}
