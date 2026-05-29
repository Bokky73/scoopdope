import { useEffect, useState } from 'react';

/**
 * Hook to get the CSP nonce from request headers
 * Used for inline scripts and styles
 */
export function useCSPNonce(): string | undefined {
  const [nonce, setNonce] = useState<string | undefined>();

  useEffect(() => {
    // Get nonce from meta tag set by middleware
    const nonceElement = document.querySelector('meta[property="csp-nonce"]');
    if (nonceElement) {
      setNonce(nonceElement.getAttribute('content') || undefined);
    }
  }, []);

  return nonce;
}

/**
 * Hook to safely execute inline scripts with nonce
 */
export function useInlineScript(script: string, nonce?: string) {
  useEffect(() => {
    if (!script) return;

    const scriptElement = document.createElement('script');
    if (nonce) {
      scriptElement.nonce = nonce;
    }
    scriptElement.textContent = script;
    document.body.appendChild(scriptElement);

    return () => {
      document.body.removeChild(scriptElement);
    };
  }, [script, nonce]);
}
