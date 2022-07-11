import escapeHtml from "escape-html";

export type Value = null | undefined | string | number | boolean | Promise<string>;
export type Values = (Value | Value[])[];

const resolveValues = (values: Values): Promise<string[]> =>
  Promise.all(
    values.map((value) => {
      if (value == null) {
        return "";
      }

      switch (typeof value) {
        case "string":
          return escapeHtml(value);
        case "number":
        case "boolean":
          return value.toString();
        case "object":
          if (Array.isArray(value)) {
            return resolveValues(value).then((values) => values.join(""));
          } else if (typeof value.then === "function") {
            return value;
          }
        default:
          return escapeHtml(String(value));
      }
    }),
  );

export default (strings: TemplateStringsArray, ...values: Values) =>
  resolveValues(values).then((values) => strings.reduce((html, string, i) => html + values[i - 1] + string));
