import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '@/core/config/emailjs';

class EmailService {
  private initialized = false;

  private ensureInitialized() {
    if (!this.initialized) {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
      this.initialized = true;
    }
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Gửi email chứa mã OTP
   * @param toEmail - Email người nhận
   * @param otpCode - Mã OTP cần gửi
   * @returns Promise với kết quả gửi email
   */
  async sendOTPEmail(toEmail: string, otpCode: string): Promise<{ success: boolean; message: string }> {
    try {
      this.ensureInitialized();

      const templateParams = {
        to_email: toEmail,
        name: toEmail.split('@')[0], 
        user_name: toEmail.split('@')[0], 
        otp_code: otpCode,
        email: toEmail, 
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );

      if (response.status === 200) {
        return {
          success: true,
          message: 'Email đã được gửi thành công!',
        };
      }

      return {
        success: false,
        message: 'Không thể gửi email. Vui lòng thử lại!',
      };
    } catch {
      return {
        success: false,
        message: 'Đã xảy ra lỗi khi gửi email. Vui lòng kiểm tra cấu hình EmailJS!',
      };
    }
  }

  /**
   * Gửi email với template tùy chỉnh
   * @param templateParams - Các tham số cho template
   * @returns Promise với kết quả gửi email
   */
  async sendCustomEmail(templateParams: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
    try {
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );

      if (response.status === 200) {
        return {
          success: true,
          message: 'Email đã được gửi thành công!',
        };
      }

      return {
        success: false,
        message: 'Không thể gửi email. Vui lòng thử lại!',
      };
    } catch {
      return {
        success: false,
        message: 'Đã xảy ra lỗi khi gửi email!',
      };
    }
  }
}

export const emailService = new EmailService();
export default EmailService;
