function resolveRef(root, ref) {
  if (!ref.startsWith("#/")) throw new Error(`Only local JSON Schema refs are supported: ${ref}`);
  return ref.slice(2).split("/").reduce((value, token) => value?.[token.replace(/~1/g, "/").replace(/~0/g, "~")], root);
}
const typeMatches = (value, type) => {
  if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  if (type === "array") return Array.isArray(value);
  if (type === "integer") return Number.isInteger(value);
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  if (type === "string") return typeof value === "string";
  if (type === "boolean") return typeof value === "boolean";
  if (type === "null") return value === null;
  return true;
};
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function validateJsonSchema(value, schema, root = schema, path = "") {
  const errors = [];
  const add = (message) => errors.push({ code: "JSON_SCHEMA", path: path || "/", message });
  if (schema.$ref) {
    const target = resolveRef(root, schema.$ref);
    if (!target) return [{ code: "JSON_SCHEMA", path: path || "/", message: `unresolved ref ${schema.$ref}` }];
    return validateJsonSchema(value, target, root, path);
  }
  if (schema.const !== undefined && !equal(value, schema.const)) add(`must equal ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.some((item) => equal(value, item))) add(`must be one of ${schema.enum.map((item) => JSON.stringify(item)).join(", ")}`);
  if (schema.type && !typeMatches(value, schema.type)) {
    add(`must be ${schema.type}`);
    return errors;
  }
  if (schema.type === "object" && value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const field of schema.required || []) if (!(field in value)) errors.push({ code: "JSON_SCHEMA", path: `${path}/${field}` || `/${field}`, message: "required property missing" });
    const properties = schema.properties || {};
    if (schema.additionalProperties === false) {
      for (const field of Object.keys(value)) if (!(field in properties)) errors.push({ code: "JSON_SCHEMA", path: `${path}/${field}`, message: "additional property forbidden" });
    }
    for (const [field, childSchema] of Object.entries(properties)) if (field in value) errors.push(...validateJsonSchema(value[field], childSchema, root, `${path}/${field}`));
  }
  if (schema.type === "array" && Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) add(`must contain at least ${schema.minItems} items`);
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) add("items must be unique");
    if (schema.items) value.forEach((item, index) => errors.push(...validateJsonSchema(item, schema.items, root, `${path}/${index}`)));
  }
  if (schema.type === "string" && typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) add(`minimum length is ${schema.minLength}`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) add(`does not match ${schema.pattern}`);
    if (schema.format === "date-time" && !Number.isFinite(Date.parse(value))) add("must be an ISO date-time");
  }
  if (["integer", "number"].includes(schema.type) && typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) add(`must be >= ${schema.minimum}`);
  }
  return errors;
}
