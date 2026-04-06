// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation requirements:
// At least 8 characters, at least one uppercase, one lowercase, one number, one special character
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function validateEmail(email) {
  if (!email || email.trim() === '') {
    return { valid: false, message: 'Email is required' };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, message: 'Please enter a valid email format (e.g., user@example.com)' };
  }
  return { valid: true };
}

function validatePassword(password) {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (@$!%*?&)' };
  }
  
  return { valid: true };
}

function validatePhoneNumber(phone) {
  if (!phone || phone.trim() === '') {
    return { valid: false, message: 'Phone number is required' };
  }
  const phoneRegex = /^[0-9\-\+\(\)\s]{7,}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: 'Please enter a valid phone number' };
  }
  return { valid: true };
}

function validateAddress(address) {
  if (!address || address.trim() === '') {
    return { valid: false, message: 'Address is required' };
  }
  if (address.trim().length < 5) {
    return { valid: false, message: 'Address must be at least 5 characters long' };
  }
  return { valid: true };
}

function validateName(name) {
  if (!name || name.trim() === '') {
    return { valid: false, message: 'This field is required' };
  }
  if (name.trim().length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters long' };
  }
  return { valid: true };
}

module.exports = {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateAddress,
  validateName
};
