import fs from "fs";
const s = JSON.parse(fs.readFileSync("src/api/openapi.json", "utf8"));
const schemas = s.components?.schemas || {};
const keys = Object.keys(schemas);
const search = keys.filter(
  (k) =>
    k.includes("Search") ||
    k.includes("Quota") ||
    k.includes("Advanced") ||
    k.includes("Enrich") ||
    k.includes("Execute") ||
    k.includes("Approve"),
);
console.log("Relevant schemas:", search.join(", "));
for (const name of [
  "SearchCreateRequest",
  "AdvancedSearchFiltersDTO",
  "SearchApproveRequest",
  "SearchExecuteRequest",
]) {
  if (schemas[name]) {
    const props = schemas[name].properties || {};
    console.log("\n" + name + " properties:", Object.keys(props).join(", "));
  }
}
