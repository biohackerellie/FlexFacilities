export function serializeJSON<T>(data: T) {
  const jsonString = JSON.stringify(data, (_key, value) =>
    typeof value === 'bigint' ? Number(value) : value,
  );

  const jsonObject: T = JSON.parse(jsonString);

  return jsonObject;
}
