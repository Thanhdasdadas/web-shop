import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';

type Props = {
  onSuccess: (idToken: string) => void;
  onError?: () => void;
  disabled?: boolean;
};

export function GoogleSignInButton({ onSuccess, onError, disabled }: Props) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        Thêm <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> vào file <code className="font-mono">client/.env</code>{' '}
        (lấy từ{' '}
        <a
          href="https://console.cloud.google.com/apis/credentials"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          Google Cloud Console
        </a>
        ).
      </p>
    );
  }

  return (
    <div className={disabled ? 'pointer-events-none opacity-50' : undefined}>
      <GoogleLogin
        onSuccess={(res: CredentialResponse) => {
          if (res.credential) onSuccess(res.credential);
          else onError?.();
        }}
        onError={() => onError?.()}
        theme="outline"
        size="large"
        width="100%"
        text="continue_with"
        shape="rectangular"
      />
    </div>
  );
}
