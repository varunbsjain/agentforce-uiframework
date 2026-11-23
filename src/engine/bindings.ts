export function getPath(data: Record<string, unknown>, path: string): unknown {
  if (!/^[a-zA-Z_$][\w$]*(\.[a-zA-Z_$][\w$]*)*$/.test(path)) return undefined;
  return path.split('.').reduce<unknown>((value, key) => value && typeof value==='object' && Object.prototype.hasOwnProperty.call(value,key) ? (value as Record<string,unknown>)[key] : undefined,data);
}
export function resolveValue(value: unknown, data: Record<string,unknown>): unknown {
  if (typeof value==='string' && /^\$data\.[\w$.]+$/.test(value)) return getPath(data,value.slice(6));
  return value;
}
