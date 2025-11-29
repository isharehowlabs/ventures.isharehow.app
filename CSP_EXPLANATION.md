# Content Security Policy (CSP) Explanation

## What is CSP?

Content Security Policy (CSP) is a security feature that helps prevent Cross-Site Scripting (XSS) attacks by controlling which resources (scripts, styles, images, etc.) a web page can load.

## Understanding the Error

The error you're seeing:
```
Loading the script 'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js' 
violates the following Content Security Policy directive: 
"script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules'"
```

### Breaking it down:

1. **What's being blocked**: A script from `stackpath.bootstrapcdn.com` (Bootstrap CDN)
2. **Why it's blocked**: The CSP policy only allows scripts from:
   - `'self'` - Same origin as the page
   - `'wasm-unsafe-eval'` - WebAssembly evaluation
   - `'inline-speculation-rules'` - Speculation rules for prefetching
3. **What's missing**: External CDN domains are NOT allowed

### Current Policy:
```
script-src 'self' 'wasm-unsafe-eval' 'inline-speculation-rules'
```

This means:
- ✅ Scripts from the same domain: ALLOWED
- ✅ WebAssembly eval: ALLOWED  
- ✅ Speculation rules: ALLOWED
- ❌ Scripts from CDNs (like Bootstrap): BLOCKED
- ❌ Inline scripts: BLOCKED
- ❌ External scripts: BLOCKED

## Where is this coming from?

**This error is NOT from your Next.js app!** 

It's coming from a **browser extension** (likely a password manager or form filler) that's trying to inject Bootstrap scripts. You can see this from the error context showing `chrome-extension://` URLs.

## CSP Directives Explained

Common CSP directives:

- `script-src` - Controls which scripts can be executed
- `style-src` - Controls which stylesheets can be loaded
- `img-src` - Controls which images can be loaded
- `connect-src` - Controls which URLs can be loaded via fetch/XHR
- `font-src` - Controls which fonts can be loaded
- `frame-src` - Controls which URLs can be embedded as frames

### Common values:

- `'self'` - Same origin only
- `'unsafe-inline'` - Allows inline scripts/styles (less secure)
- `'unsafe-eval'` - Allows eval() (less secure)
- `https:` - Any HTTPS URL
- `*` - Any origin (very permissive, less secure)
- Specific domains like `https://cdn.example.com`

## Example CSP Policies

### Very Restrictive (Most Secure):
```
script-src 'self';
style-src 'self';
img-src 'self';
connect-src 'self';
```

### Moderate (Common for apps with CDNs):
```
script-src 'self' https://cdn.jsdelivr.net https://unpkg.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https:;
connect-src 'self' https://api.example.com;
```

### Permissive (Development only, NOT for production):
```
script-src * 'unsafe-inline' 'unsafe-eval';
style-src * 'unsafe-inline';
```

## How to Add CSP to Your Next.js App

### Option 1: Next.js Headers (Recommended for Static Export)

Since you're using `output: 'export'`, you'll need to set headers at the server/hosting level.

### Option 2: Meta Tag (Less Secure, but Works)

Add to `pages/_document.tsx` or `app/layout.tsx`:

```tsx
<Head>
  <meta
    httpEquiv="Content-Security-Policy"
    content="
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' https://fonts.gstatic.com;
      img-src 'self' data: https:;
      connect-src 'self' https://api.ventures.isharehow.app wss://api.ventures.isharehow.app;
    "
  />
</Head>
```

### Option 3: Server Headers (Best for Production)

If using a server or CDN (like Cloudflare, Vercel, etc.), set headers there.

## For Your Current Situation

**You don't need to fix this error** because:
1. It's from a browser extension, not your app
2. Your app doesn't currently have CSP configured
3. The extension's CSP is blocking its own scripts (extension issue)

If you want to add CSP to your app for security, you would need to:
1. Identify all external resources you use (CDNs, APIs, etc.)
2. Create a CSP policy that allows those resources
3. Test thoroughly to ensure nothing breaks

## Testing CSP

1. Use browser DevTools Console to see CSP violations
2. Use online CSP evaluators: https://csp-evaluator.withgoogle.com/
3. Start restrictive and gradually add exceptions as needed

## Resources

- MDN CSP Guide: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- CSP Evaluator: https://csp-evaluator.withgoogle.com/
- CSP Builder: https://www.cspisawesome.com/

