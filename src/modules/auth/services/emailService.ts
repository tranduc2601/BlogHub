import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '@/core/config/emailjs';

class EmailService {
  private initialized = false;

  private ensureInitialized() {
    if (!this.initialized) {
      console.log('🔧 Initializing EmailJS with config:', {
        SERVICE_ID: EMAILJS_CONFIG.SERVICE_ID,
        TEMPLATE_ID: EMAILJS_CONFIG.TEMPLATE_ID,
        PUBLIC_KEY: EMAILJS_CONFIG.PUBLIC_KEY.substring(0, 5) + '...',
      });
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

      console.log('📧 Sending email via EmailJS:', {
        to: toEmail,
        otp: otpCode,
        serviceId: EMAILJS_CONFIG.SERVICE_ID,
        templateId: EMAILJS_CONFIG.TEMPLATE_ID,
      });

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );

      console.log('✅ EmailJS Response:', response);

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
    } catch (error) {
      console.error('❌ EmailJS Error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
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
    } catch (error) {
      console.error('EmailJS Error:', error);
      return {
        success: false,
        message: 'Đã xảy ra lỗi khi gửi email!',
      };
    }
  }
}

export const emailService = new EmailService();
export default EmailService;
