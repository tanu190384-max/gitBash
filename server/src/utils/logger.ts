/* eslint-disable no-console */
const stamp = () => new Date().toISOString().slice(11, 19);
const tag = (level: string) => `${stamp()} [${level}]`;

export const logger = {
  info: (...a: unknown[]) => console.log(tag('info'), ...a),
  warn: (...a: unknown[]) => console.warn(tag('warn'), ...a),
  error: (...a: unknown[]) => console.error(tag('error'), ...a),
  debug: (...a: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') console.log(tag('debug'), ...a);
  },
};
