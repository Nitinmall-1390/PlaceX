import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              width?: string | number;
            }
          ) => void;
        };
      };
    };
  }
}

interface GoogleAuthButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (error: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onSuccess,
  onError,
  text = 'continue_with',
}) => {
  const btnRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '252436544519-k2bcdb1e68v68p1vrtk8togjdajofsp9.apps.googleusercontent.com';

  useEffect(() => {
    // 1. Check if script is already present
    const existingScript = document.getElementById('google-gsi-client');
    
    const initGoogle = () => {
      if (window.google?.accounts?.id && btnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: { credential: string }) => {
              if (response.credential) {
                onSuccess(response.credential);
              } else if (onError) {
                onError('Credential missing from Google response');
              }
            },
          });

          // Render official button
          btnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(btnRef.current, {
            theme: 'filled_black',
            size: 'medium',
            text: text,
            shape: 'rectangular',
            width: 240,
          });
        } catch (err: any) {
          console.error('[GoogleAuth] Init error:', err);
          if (onError) onError(err.message || 'Google Auth Init Failed');
        }
      }
    };

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.body.appendChild(script);
    } else {
      initGoogle();
    }
  }, [clientId, text]);

  return (
    <div className="flex items-center justify-center min-h-[40px]">
      <div ref={btnRef} />
    </div>
  );
};

export default GoogleAuthButton;
