const serialize = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const write = (stream: NodeJS.WriteStream, level: string, values: unknown[]) => {
  const message = values.map(serialize).join(" ");
  stream.write(`[${level}] ${message}\n`);
};

export const logInfo = (...values: unknown[]) => {
  write(process.stdout, "INFO", values);
};

export const logWarn = (...values: unknown[]) => {
  write(process.stdout, "WARN", values);
};

export const logError = (...values: unknown[]) => {
  write(process.stderr, "ERROR", values);
};
