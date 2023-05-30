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
