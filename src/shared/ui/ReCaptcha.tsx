import { forwardRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCaptchaProps {
  onChange: (token: string | null) => void;
  onExpired?: () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
}

const ReCaptcha = forwardRef<ReCAPTCHA, ReCaptchaProps>(
  ({ onChange, onExpired, theme = 'light', size = 'normal' }, ref) => {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
      console.error('VITE_RECAPTCHA_SITE_KEY is not defined in environment variables');
      return (
        <div className="text-center text-red-500 text-sm p-3 bg-red-50 rounded-lg">
          <i className="fa-solid fa-exclamation-triangle mr-2"></i>
          CAPTCHA không được cấu hình. Vui lòng liên hệ quản trị viên!
        </div>
      );
    }

    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.toString().includes('SecurityError') && args[0]?.toString().includes('recaptcha')) {
        return;
      }
      originalError.apply(console, args);
    };

    return (
      <div className="flex justify-center my-4">
        <ReCAPTCHA
          ref={ref}
          sitekey={siteKey}
          onChange={onChange}
          onExpired={onExpired}
          theme={theme}
          size={size}
        />
      </div>
    );
  }
);

ReCaptcha.displayName = 'ReCaptcha';

export default ReCaptcha;
