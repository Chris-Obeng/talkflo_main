[02:56:03.709] Running build in Washington, D.C., USA (East) – iad1
[02:56:03.710] Build machine configuration: 2 cores, 8 GB
[02:56:03.733] Cloning github.com/Chris-Obeng/talkflo_main (Branch: main, Commit: a60948b)
[02:56:03.745] Skipping build cache, deployment was triggered without cache.
[02:56:04.214] Cloning completed: 480.000ms
[02:56:07.642] Running "vercel build"
[02:56:08.139] Vercel CLI 44.7.3
[02:56:08.469] Installing dependencies...
[02:56:12.610] npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
[02:56:24.191] 
[02:56:24.192] added 480 packages in 15s
[02:56:24.193] 
[02:56:24.200] 164 packages are looking for funding
[02:56:24.201]   run `npm fund` for details
[02:56:24.261] Detected Next.js version: 15.4.6
[02:56:24.265] Running "npm run build"
[02:56:24.423] 
[02:56:24.423] > build
[02:56:24.423] > next build
[02:56:24.423] 
[02:56:25.210]  ⚠ Found lockfile missing swc dependencies, run next locally to automatically patch
[02:56:25.226] Attention: Next.js now collects completely anonymous telemetry regarding usage.
[02:56:25.227] This information is used to shape Next.js' roadmap and prioritize features.
[02:56:25.227] You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[02:56:25.227] https://nextjs.org/telemetry
[02:56:25.227] 
[02:56:25.332]    ▲ Next.js 15.4.6
[02:56:25.333] 
[02:56:25.386]    Creating an optimized production build ...
[02:56:26.138]  ⚠ Found lockfile missing swc dependencies, run next locally to automatically patch
[02:56:36.367]  ⚠ Found lockfile missing swc dependencies, run next locally to automatically patch
[02:56:41.247] <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (108kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
[02:56:41.672]  ⚠ Compiled with warnings in 5.0s
[02:56:41.672] 
[02:56:41.672] ./node_modules/@supabase/supabase-js/dist/module/index.js
[02:56:41.673] A Node.js API is used (process.version at line: 17) which is not supported in the Edge Runtime.
[02:56:41.673] Learn more: https://nextjs.org/docs/api-reference/edge-runtime
[02:56:41.673] 
[02:56:41.673] Import trace for requested module:
[02:56:41.673] ./node_modules/@supabase/supabase-js/dist/module/index.js
[02:56:41.673] ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
[02:56:41.673] ./node_modules/@supabase/ssr/dist/module/index.js
[02:56:41.673] ./lib/supabase/middleware.ts
[02:56:41.673] 
[02:56:41.674] ./node_modules/@supabase/supabase-js/dist/module/index.js
[02:56:41.674] A Node.js API is used (process.version at line: 18) which is not supported in the Edge Runtime.
[02:56:41.674] Learn more: https://nextjs.org/docs/api-reference/edge-runtime
[02:56:41.674] 
[02:56:41.674] Import trace for requested module:
[02:56:41.674] ./node_modules/@supabase/supabase-js/dist/module/index.js
[02:56:41.674] ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
[02:56:41.674] ./node_modules/@supabase/ssr/dist/module/index.js
[02:56:41.674] ./lib/supabase/middleware.ts
[02:56:41.674] 
[02:56:41.674] ./node_modules/@supabase/supabase-js/dist/module/index.js
[02:56:41.674] A Node.js API is used (process.version at line: 21) which is not supported in the Edge Runtime.
[02:56:41.675] Learn more: https://nextjs.org/docs/api-reference/edge-runtime
[02:56:41.675] 
[02:56:41.675] Import trace for requested module:
[02:56:41.675] ./node_modules/@supabase/supabase-js/dist/module/index.js
[02:56:41.675] ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
[02:56:41.675] ./node_modules/@supabase/ssr/dist/module/index.js
[02:56:41.675] ./lib/supabase/middleware.ts
[02:56:41.676] 
[02:56:42.425]  ⚠ Found lockfile missing swc dependencies, run next locally to automatically patch
[02:56:44.608] 
[02:56:44.608] [1m[33mwarn[39m[22m - As of Tailwind CSS v3.3, the `@tailwindcss/line-clamp` plugin is now included by default.
[02:56:44.609] [1m[33mwarn[39m[22m - Remove it from the `plugins` array in your configuration to eliminate this warning.
[02:56:49.944]  ✓ Compiled successfully in 21.0s
[02:56:49.953]    Linting and checking validity of types ...
[02:57:00.871]    Collecting page data ...
[02:57:01.475]  ⚠ Using edge runtime on a page currently disables static generation for that page
[02:57:03.873]    Generating static pages (0/23) ...
[02:57:04.651]  ⚠ Unsupported metadata themeColor is configured in metadata export in /_not-found. Please move it to viewport export instead.
[02:57:04.652] Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
[02:57:04.652]  ⨯ useSearchParams() should be wrapped in a suspense boundary at page "/404". Read more: https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout
[02:57:04.652]     at g (/vercel/path0/.next/server/chunks/519.js:3:14813)
[02:57:04.653]     at l (/vercel/path0/.next/server/chunks/519.js:7:57406)
[02:57:04.653]     at e (/vercel/path0/.next/server/app/_not-found/page.js:6:3469)
[02:57:04.653]     at n4 (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:81697)
[02:57:04.653]     at n8 (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:83467)
[02:57:04.653]     at n8 (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:100435)
[02:57:04.654]     at n9 (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:103676)
[02:57:04.654]     at n5 (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:101094)
[02:57:04.654]     at ii (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:107046)
[02:57:04.654]     at n7 (/vercel/path0/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:2:105708)
[02:57:04.709] Error occurred prerendering page "/_not-found". Read more: https://nextjs.org/docs/messages/prerender-error
[02:57:04.709] Export encountered an error on /_not-found/page: /_not-found, exiting the build.
[02:57:04.715]  ⨯ Next.js build worker exited with code: 1 and signal: null
[02:57:04.749] Error: Command "npm run build" exited with 1