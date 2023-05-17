import { Transform } from 'class-transformer';

export function TransformArrayString() {
  function transformArrStr({ value }) {
    if (typeof value == 'string') {
      return value
        .trim()
        .split(',')
        .filter((val: any) => val.trim() !== '')
        .map((item) => String(item).trim());
    } else {
      return value;
    }
  }
  return Transform(transformArrStr);
}
