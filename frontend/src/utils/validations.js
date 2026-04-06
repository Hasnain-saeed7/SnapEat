// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation requirements:
// At least 8 characters, at least one uppercase, one lowercase, one number, one special character
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validateEmail = (email) => {
  const errors = [];
  
  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push('Please enter a valid email format (e.g., user@example.com)');
  }
  
  return errors;
};

export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
  }
  
  return errors;
};

export const validatePasswordStrength = (password) => {
  if (!password) return 0;
  
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/@$!%*?&/.test(password)) strength++;
  
  return Math.min(strength, 4); // 0-4 scale
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return ['Confirm password is required'];
  }
  if (password !== confirmPassword) {
    return ['Passwords do not match'];
  }
  return [];
};

export const validateName = (name) => {
  const errors = [];
  
  if (!name || name.trim() === '') {
    errors.push('This field is required');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }
  
  return errors;
};

export const validatePhone = (phone) => {
  const errors = [];
  const phoneRegex = /^[0-9\-\+\(\)\s]{7,}$/;
  
  if (!phone || phone.trim() === '') {
    errors.push('Phone number is required');
  } else if (!phoneRegex.test(phone)) {
    errors.push('Please enter a valid phone number');
  }
  
  return errors;
};

export const validateAddress = (address) => {
  const errors = [];
  
  if (!address || address.trim() === '') {
    errors.push('Address is required');
  } else if (address.trim().length < 5) {
    errors.push('Address must be at least 5 characters long');
  }
  
  return errors;
};

// Get password strength label
export const getPasswordStrengthLabel = (strength) => {
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return labels[strength] || 'Very Weak';
};

// Get password strength color
export const getPasswordStrengthColor = (strength) => {
  const colors = ['#DC2626', '#F97316', '#EAB308', '#84CC16', '#059669'];
  return colors[strength] || '#DC2626';
};
