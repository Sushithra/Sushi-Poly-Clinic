import React, { useEffect, useRef } from 'react';
import { GOOGLE_CLIENT_ID } from '../../config/env.js';

let googleScriptPromise;

const loadGoogleScript = () => {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector('script[data-google-gsi="true"]');
      if (existingScript) {
        existingScript.addEventListener('load', resolve, { once: true });
        existingScript.addEventListener('error', reject, { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.dataset.googleGsi = 'true';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google sign-in script'));
      document.body.appendChild(script);
    });
  }

  return googleScriptPromise;
};

export default function GoogleSignInButton({ onCredential, prompt = 'Continue with Google' }) {
  const containerRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const clientId = GOOGLE_CLIENT_ID;

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let cancelled = false;

    const initGoogle = async () => {
      try {
        await loadGoogleScript();
        if (cancelled || !window.google?.accounts?.id || !containerRef.current) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) {
              callbackRef.current?.(response.credential);
            }
          },
        });

        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          shape: 'pill',
        });
      } catch (error) {
        if (!cancelled) {
          console.error('Google sign-in setup failed:', error);
        }
      }
    };

    initGoogle();

    return () => {
      cancelled = true;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [clientId]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-neutral-500">or</span>
        </div>
      </div>
      {!clientId ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Google sign-in is not configured. Add `VITE_GOOGLE_CLIENT_ID` in the client env file.
        </div>
      ) : (
        <div ref={containerRef} aria-label={prompt} />
      )}
    </div>
  );
}
