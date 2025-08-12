[00:50:17.384] Running build in Washington, D.C., USA (East) – iad1
[00:50:17.397] Build machine configuration: 2 cores, 8 GB
[00:50:17.452] Cloning github.com/Chris-Obeng/talkflo_main (Branch: main, Commit: 4296b66)
[00:50:17.471] Skipping build cache, deployment was triggered without cache.
[00:50:18.127] Cloning completed: 675.000ms
[00:50:20.930] Running "vercel build"
[00:50:21.365] Vercel CLI 44.7.3
[00:50:21.865] Installing dependencies...
[00:50:25.682] npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
[00:50:35.025] 
[00:50:35.026] added 480 packages in 13s
[00:50:35.026] 
[00:50:35.026] 164 packages are looking for funding
[00:50:35.027]   run `npm fund` for details
[00:50:35.085] Detected Next.js version: 15.4.6
[00:50:35.089] Running "npm run build"
[00:50:35.196] 
[00:50:35.196] > build
[00:50:35.196] > next build
[00:50:35.196] 
[00:50:35.917]  ⚠ Found lockfile missing swc dependencies, run next locally to automatically patch
[00:50:35.932] Attention: Next.js now collects completely anonymous telemetry regarding usage.
[00:50:35.932] This information is used to shape Next.js' roadmap and prioritize features.
[00:50:35.933] You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[00:50:35.933] https://nextjs.org/telemetry
[00:50:35.933] 
[00:50:36.035]    ▲ Next.js 15.4.6
[00:50:36.036] 
[00:50:36.077]    Creating an optimized production build ...
[00:50:36.774]  ⚠ Found lockfile missing swc dependencies, run next locally to automatically patch
[00:50:46.628]  ⚠ Found lockfile missing swc dependencies, run next locally to automatically patch
[00:50:50.744] <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (108kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
[00:50:51.109]  ⚠ Compiled with warnings in 4.0s
[00:50:51.109] 
[00:50:51.110] ./node_modules/@supabase/supabase-js/dist/module/index.js
[00:50:51.110] A Node.js API is used (process.version at line: 17) which is not supported in the Edge Runtime.
[00:50:51.110] Learn more: https://nextjs.org/docs/api-reference/edge-runtime
[00:50:51.110] 
[00:50:51.110] Import trace for requested module:
[00:50:51.111] ./node_modules/@supabase/supabase-js/dist/module/index.js
[00:50:51.111] ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
[00:50:51.111] ./node_modules/@supabase/ssr/dist/module/index.js
[00:50:51.111] ./lib/supabase/middleware.ts
[00:50:51.111] 
[00:50:51.112] ./node_modules/@supabase/supabase-js/dist/module/index.js
[00:50:51.112] A Node.js API is used (process.version at line: 18) which is not supported in the Edge Runtime.
[00:50:51.112] Learn more: https://nextjs.org/docs/api-reference/edge-runtime
[00:50:51.112] 
[00:50:51.112] Import trace for requested module:
[00:50:51.112] ./node_modules/@supabase/supabase-js/dist/module/index.js
[00:50:51.112] ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
[00:50:51.113] ./node_modules/@supabase/ssr/dist/module/index.js
[00:50:51.113] ./lib/supabase/middleware.ts
[00:50:51.113] 
[00:50:51.113] ./node_modules/@supabase/supabase-js/dist/module/index.js
[00:50:51.113] A Node.js API is used (process.version at line: 21) which is not supported in the Edge Runtime.
[00:50:51.113] Learn more: https://nextjs.org/docs/api-reference/edge-runtime
[00:50:51.114] 
[00:50:51.114] Import trace for requested module:
[00:50:51.114] ./node_modules/@supabase/supabase-js/dist/module/index.js
[00:50:51.114] ./node_modules/@supabase/ssr/dist/module/createBrowserClient.js
[00:50:51.114] ./node_modules/@supabase/ssr/dist/module/index.js
[00:50:51.115] ./lib/supabase/middleware.ts
[00:50:51.115] 
[00:50:51.810]  ⚠ Found lockfile missing swc dependencies, run next locally to automatically patch
[00:50:53.791] 
[00:50:53.792] [1m[33mwarn[39m[22m - As of Tailwind CSS v3.3, the `@tailwindcss/line-clamp` plugin is now included by default.
[00:50:53.792] [1m[33mwarn[39m[22m - Remove it from the `plugins` array in your configuration to eliminate this warning.
[00:50:58.181]  ✓ Compiled successfully in 18.0s
[00:50:58.186]    Linting and checking validity of types ...
[00:51:05.167] 
[00:51:05.168] Failed to compile.
[00:51:05.168] 
[00:51:05.169] ./components/ga-tracker.tsx
[00:51:05.169] 8:22  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[00:51:05.169] 
[00:51:05.169] ./components/notes-dashboard.tsx
[00:51:05.169] 119:9  Warning: The 'handleDeleteSelected' function makes the dependencies of useEffect Hook (at line 177) change on every render. Move it inside the useEffect callback. Alternatively, wrap the definition of 'handleDeleteSelected' in its own useCallback() Hook.  react-hooks/exhaustive-deps
[00:51:05.169] 142:9  Warning: The 'clearSelection' function makes the dependencies of useEffect Hook (at line 177) change on every render. Move it inside the useEffect callback. Alternatively, wrap the definition of 'clearSelection' in its own useCallback() Hook.  react-hooks/exhaustive-deps
[00:51:05.169] 
[00:51:05.169] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
[00:51:05.210] Error: Command "npm run build" exited with 1