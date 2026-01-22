# Remove Unused Dependencies - PowerShell Script
# Generated: 2026-01-22T16:48:21.034Z

Write-Host "Removing unused dependencies..." -ForegroundColor Yellow

# Regular Dependencies (22)
pnpm remove @auth/core @aws-sdk/client-s3 @icons-pack/react-simple-icons @imagekit/next @number-flow/react @radix-ui/react-icons @simplewebauthn/server @upstash/qstash @upstash/workflow @zxcvbn-ts/core @zxcvbn-ts/language-common @zxcvbn-ts/language-en babel-plugin-react-compiler cli-table3 drizzle-zod es-abstract framer-motion lodash.debounce p-limit react-email slugify undici-types

# Dev Dependencies (43)
pnpm remove -D @eslint/eslintrc @tailwindcss/postcss @types/color-convert @types/eslint-plugin-jsx-a11y @types/eslint-plugin-security @types/fs-extra @types/jest @types/lodash @types/lodash.debounce @types/ms @types/papaparse @types/react-dropzone @vitest/coverage-v8 @vitest/ui all-contributors-cli cross-env cssnano dotenv-safe eslint-formatter-compact eslint-import-resolver-next glob globby happy-dom husky jscodeshift lint-staged ms npm-check-updates pino-pretty postcss-import postcss-nested postcss-preset-env prettier-plugin-organize-imports prettier-plugin-packagejson prettier-plugin-sort-json prettier-plugin-tailwindcss redis rimraf shadcn tailwindcss-animate ts-stub tw-animate-css web-vitals

Write-Host "Done!" -ForegroundColor Green
