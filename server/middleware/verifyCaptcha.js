import axios from 'axios';

const verifyCaptcha = async (req, res, next) => {
  const { captchaToken } = req.body;


  if (!captchaToken) {
    return res.status(400).json({
      success: false,
      message: 'CAPTCHA token is required. Please verify the CAPTCHA.'
    });
  }

  try {

    const response = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captchaToken,
          remoteip: req.ip || req.connection.remoteAddress
        }
      }
    );

    const { success, 'error-codes': errorCodes } = response.data;


    if (success) {

      next();
    } else {

      console.error('CAPTCHA verification failed:', errorCodes);
      

      let errorMessage = 'CAPTCHA verification failed. Please try again!';
      
      if (errorCodes && errorCodes.includes('timeout-or-duplicate')) {
        errorMessage = 'CAPTCHA has expired or already been used. Please verify again!';
      } else if (errorCodes && errorCodes.includes('invalid-input-response')) {
        errorMessage = 'Invalid CAPTCHA token. Please refresh and try again!';
      } else if (errorCodes && errorCodes.includes('missing-input-secret')) {
        errorMessage = 'Server configuration error. Please contact administrator!';
      }

      return res.status(400).json({
        success: false,
        message: errorMessage,
        errors: errorCodes
      });
    }
  } catch (error) {
    console.error('Error verifying CAPTCHA:', error.message);
    

    return res.status(500).json({
      success: false,
      message: 'Error verifying CAPTCHA. Please try again later!',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export default verifyCaptcha;
