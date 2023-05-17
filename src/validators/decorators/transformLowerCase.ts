import { Transform } from 'class-transformer';

export function TransformLowerCase() {
  function transformLowerCase({ value }) {
    if (typeof value == 'string') {
      return value.trim().toLowerCase();
    } else {
      return value;
    }
  }

  return Transform(transformLowerCase);
}
