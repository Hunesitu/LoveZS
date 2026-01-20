import { useState, useCallback, FormEvent } from 'react';

/**
 * 验证规则类型
 */
export type ValidationRule<T = any> = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | true;
  message?: string;
};

/**
 * 验证规则配置类型
 */
export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

/**
 * 表单验证结果类型
 */
export type ValidationResult<T> = {
  [K in keyof T]?: string;
};

/**
 * 表单验证 Hook
 * 提供表单验证、错误处理和提交功能
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules<T>,
  onSubmit: (values: T) => void | Promise<void>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationResult<T>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 验证单个字段
   */
  const validateField = useCallback(
    (name: keyof T, value: any): string | undefined => {
      const rules = validationRules[name];
      if (!rules) return undefined;

      // Required validation
      if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
        return rules.message || `${String(name)}不能为空`;
      }

      // Skip other validations if value is empty and not required
      if (!value || (typeof value === 'string' && !value.trim())) {
        return undefined;
      }

      // minLength validation
      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        return rules.message || `${String(name)}至少需要${rules.minLength}个字符`;
      }

      // maxLength validation
      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        return rules.message || `${String(name)}最多${rules.maxLength}个字符`;
      }

      // Pattern validation
      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        return rules.message || `${String(name)}格式不正确`;
      }

      // Custom validation
      if (rules.custom) {
        const result = rules.custom(value);
        if (result !== true) {
          return result;
        }
      }

      return undefined;
    },
    [validationRules]
  );

  /**
   * 验证所有字段
   */
  const validateAll = useCallback((): boolean => {
    const newErrors: ValidationResult<T> = {};
    let isValid = true;

    for (const key in validationRules) {
      const error = validateField(key as keyof T, values[key]);
      if (error) {
        newErrors[key as keyof T] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules, validateField]);

  /**
   * 更新字段值
   */
  const handleChange = useCallback(
    (name: keyof T, value: any) => {
      setValues(prev => ({ ...prev, [name]: value }));

      // 如果字段已经被触摸过，实时验证
      if (touched[name]) {
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField]
  );

  /**
   * 处理字段失焦事件
   */
  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);

  /**
   * 重置表单
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);

  /**
   * 处理表单提交
   */
  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // 标记所有字段为已触摸
      const allTouched = Object.keys(validationRules).reduce((acc, key) => {
        acc[key as keyof T] = true;
        return acc;
      }, {} as Record<keyof T, boolean>);
      setTouched(allTouched);

      // 验证所有字段
      if (!validateAll()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validationRules, validateAll, onSubmit]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setValues,
    setErrors
  };
}

/**
 * 常用验证模式
 */
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,20}$/,
  phone: /^1[3-9]\d{9}$/,
  url: /^https?:\/\/.+/,
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/
};

/**
 * 常用验证规则预设
 */
export const CommonRules = {
  email: {
    required: true,
    pattern: ValidationPatterns.email,
    message: '请输入有效的邮箱地址'
  },
  username: {
    required: true,
    minLength: 2,
    maxLength: 20,
    message: '用户名长度2-20个字符'
  },
  password: {
    required: true,
    minLength: 6,
    message: '密码至少需要6个字符'
  },
  confirmPassword: (passwordValue: string) => ({
    required: true,
    custom: (value: string) => value === passwordValue || '两次输入的密码不一致'
  })
};
