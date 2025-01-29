# 3.1.1

Revert `react-is` bump, since it breaks React 18! Sorry!

Fix to README.md example (thanks @nilportugues)

# 3.1.0

Bump `react-is` to fix React 19 compatability

# 3.0.2

Bump braces from 3.0.2 to 3.0.3

Migrate `yarn.lock` to `package-lock.json`

# 3.0.1

Bump micromatch from 4.0.5 to 4.0.8

# 3.0.0

Convert to ESM by default.

Transpile to ES2015.

CommonJS now uses `module.exports` rather than `exports.default`. This
allows for importing in CommonJS without requiring explicit `default`. e.g.

```js
// Previous:
const flattenChildren = require("react-keyed-flatten-children");
flattenChildren.default(children);
// Now:
const flattenChildren = require("react-keyed-flatten-children");
flattenChildren(children);
```

(thanks @will-stone)

# 2.2.1

Removed invalid key `types` from `package.json` (thanks @imjordanxd)

# 2.2.0

Fix issue with build, `dist/` wasn't included with the ESM change (thanks @imjordanxd)

Fix Typescript version in CHANGELOG (thanks @rnestler)

Adds Node v20 support (CI coverage)

# 2.1.0

Now using React 18.2.0 and Typescript 5.0.4. If this change effects your application, depend directly on 2.0.0

# 2.0.0

BREAKING: Package is now ESM-compatible (thanks @imjordanxd!)

Bumps a number of deep dependencies with security issues

# 1.2.0

Removes `index.ts` from the distributed package

# 1.1.0

Avoid adding an extra first period to the keys at the zero depth (what was
`..$apple` is now `.$apple`)

# 1.0.0

Initial release
