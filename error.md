[04:29:16.706] Running build in Washington, D.C., USA (East) – iad1
[04:29:16.706] Build machine configuration: 2 cores, 8 GB
[04:29:16.721] Cloning github.com/Chris-Obeng/talkflo_main (Branch: main, Commit: 78c8e88)
[04:29:17.123] Cloning completed: 401.000ms
[04:29:19.613] Restored build cache from previous deployment (GNNYATp1xbFGK3ptLXbJDrhAorFk)
[04:29:24.095] Running "vercel build"
[04:29:24.610] Vercel CLI 44.7.3
[04:29:24.968] Installing dependencies...
[04:29:26.759] 
[04:29:26.759] up to date in 2s
[04:29:26.760] 
[04:29:26.760] 164 packages are looking for funding
[04:29:26.760]   run `npm fund` for details
[04:29:26.791] Detected Next.js version: 15.4.6
[04:29:26.797] Running "npm run build"
[04:29:26.918] 
[04:29:26.918] > build
[04:29:26.918] > next build
[04:29:26.919] 
[04:29:28.079]  ⚠ Found lockfile missing swc dependencies, run next locally to automatically patch
[04:29:28.299]    ▲ Next.js 15.4.6
[04:29:28.299] 
[04:29:28.360]    Creating an optimized production build ...
[04:29:29.223]  ⚠ Found lockfile missing swc dependencies, run next locally to automatically patch
[04:29:35.109]  ⚠ Found lockfile missing swc dependencies, run next locally to automatically patch
[04:29:37.051]  ⚠ Found lockfile missing swc dependencies, run next locally to automatically patch
[04:29:41.029]  ✓ Compiled successfully in 7.0s
[04:29:41.035]    Linting and checking validity of types ...
[04:29:48.928] 
[04:29:48.929] Failed to compile.
[04:29:48.929] 
[04:29:48.929] ./components/landing/hero-section.tsx
[04:29:48.929] 130:29  Error: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.  @typescript-eslint/ban-ts-comment
[04:29:48.930] 131:41  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[04:29:48.930] 170:27  Error: Use "@ts-expect-error" instead of "@ts-ignore", as "@ts-ignore" will do nothing if the following line is error-free.  @typescript-eslint/ban-ts-comment
[04:29:48.930] 171:44  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[04:29:48.930] 172:41  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[04:29:48.930] 173:44  Error: Unexpected any. Specify a different type.  @typescript-eslint/no-explicit-any
[04:29:48.930] 
[04:29:48.931] info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/app/api-reference/config/eslint#disabling-rules
[04:29:48.974] Error: Command "npm run build" exited with 1