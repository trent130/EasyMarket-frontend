import { ValidationError } from './errorHandling';

interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

export class Validator<T> {
  private rules: ValidationRule<T>[] = [];

  required(message: string = 'This field is required'): Validator<T> {
    this.rules.push({
      validate: (value: T) => {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return true;
      },
      message
    });
    return this;
  }

  min(min: number, message: string = `Value must be at least ${min}`): Validator<T> {
    this.rules.push({
      validate: (value: T) => {
        if (typeof value === 'number') return value >= min;
        if (typeof value === 'string') return value.length >= min;
        if (Array.isArray(value)) return value.length >= min;
        return false;
      },
      message
    });
    return this;
  }

  max(max: number, message: string = `Value must be at most ${max}`): Validator<T> {
    this.rules.push({
      validate: (value: T) => {
        if (typeof value === 'number') return value <= max;
        if (typeof value === 'string') return value.length <= max;
        if (Array.isArray(value)) return value.length <= max;
        return false;
      },
      message
    });
    return this;
  }

  email(message: string = 'Invalid email address'): Validator<T> {
    this.rules.push({
      validate: (value: T) => {
        if (typeof value !== 'string') return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message
    });
    return this;
  }

  pattern(regex: RegExp, message: string): Validator<T> {
    this.rules.push({
      validate: (value: T) => {
        if (typeof value !== 'string') return false;
        return regex.test(value);
      },
      message
    });
    return this;
  }

  custom(validateFn: (value: T) => boolean, message: string): Validator<T> {
    this.rules.push({
      validate: validateFn,
      message
    });
    return this;
  }

  validate(value: T): string[] {
    const errors = this.rules
      .filter(rule => !rule.validate(value))
      .map(rule => rule.message);
    
    return errors;
  }
}

export function validateObject<T extends Record<string, any>>(
  data: T,
  validationRules: { [K in keyof T]?: Validator<T[K]> }
): void {
  const errors: Record<string, string[]> = {};

  for (const [key, validator] of Object.entries(validationRules)) {
    if (validator) {
      const fieldErrors = validator.validate(data[key]);
      if (fieldErrors.length > 0) {
        errors[key] = fieldErrors;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

// Example usage:
// const emailValidator = new Validator<string>()
//   .required()
//   .email();
//
// const passwordValidator = new Validator<string>()
//   .required()
//   .min(8)
//   .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 'Password must contain at least one letter and one number');
//
// validateObject({
//   email: 'test@example.com',
//   password: 'password123'
// }, {
//   email: emailValidator,
//   password: passwordValidator
// });

export function isValidSlug(slug: string): boolean {
    // Basic slug validation
    const slugRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
}