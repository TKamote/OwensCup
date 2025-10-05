module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/LocalDev/OwensCup/web/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "build/chunks/db18f_2b0a475d._.js",
  "build/chunks/[root-of-the-server]__8daac200._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/LocalDev/OwensCup/web/postcss.config.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];