import fs from "fs";
const spec = JSON.parse(fs.readFileSync("src/api/openapi.json", "utf8"));
const paths = spec.paths || {};
const out = [];
for (const [path, methods] of Object.entries(paths)) {
  for (const method of Object.keys(methods)) {
    if (!["get", "post", "put", "patch", "delete"].includes(method)) continue;
    const op = methods[method];
    const reqRef = op.requestBody?.content?.["application/json"]?.schema?.$ref;
    const req = reqRef ? reqRef.split("/").pop() : "-";
    const r200 =
      op.responses?.["200"]?.content?.["application/json"]?.schema?.$ref;
    const r201 =
      op.responses?.["201"]?.content?.["application/json"]?.schema?.$ref;
    const res = (r200 || r201 || "").split("/").pop() || "-";
    out.push({
      method: method.toUpperCase(),
      path,
      requestSchema: req,
      responseSchema: res,
    });
  }
}
console.log(JSON.stringify(out, null, 2));
