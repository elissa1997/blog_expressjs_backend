const routeValidationMap = require('../validators/route-validation.map');

function createValidationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function isEmptyValue(value) {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim() === '';
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
}

function isIntLike(value) {
  if (typeof value === 'number') {
    return Number.isInteger(value);
  }

  if (typeof value !== 'string') {
    return false;
  }

  return /^-?\d+$/.test(value.trim());
}

const typeCheckers = {
  string(value) {
    return typeof value === 'string' && value.trim() !== '';
  },
  url(value) {
    if (typeof value !== 'string' || value.trim() === '') return false;
    try {
      const parsed = new URL(value.trim());
      return ['http:', 'https:'].includes(parsed.protocol) && Boolean(parsed.hostname);
    } catch (err) {
      return false;
    }
  },
  int(value) {
    return isIntLike(value);
  },
  array(value) {
    return Array.isArray(value);
  },
  'array[int]'(value) {
    return Array.isArray(value) && value.every((item) => isIntLike(item));
  },
  'array[string]'(value) {
    return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim() !== '');
  }
};

function validateFields(data, fields) {
  const errors = [];

  for (const field of fields) {
    const value = data[field.name];

    if (field.required && isEmptyValue(value)) {
      errors.push(`${field.name} 不能为空`);
      continue;
    }

    if (isEmptyValue(value)) {
      continue;
    }

    const checker = typeCheckers[field.type];
    if (!checker) {
      errors.push(`${field.name} 类型规则未定义`);
      continue;
    }

    if (!checker(value)) {
      errors.push(`${field.name} 类型必须为 ${field.type}`);
      continue;
    }

    if (typeof value === 'string') {
      const length = value.trim().length;
      if (field.minLength !== undefined && length < field.minLength) {
        errors.push(`${field.name} 长度不能少于 ${field.minLength}`);
      }
      if (field.maxLength !== undefined && length > field.maxLength) {
        errors.push(`${field.name} 长度不能超过 ${field.maxLength}`);
      }
    }

    if (field.allowedValues && !field.allowedValues.some((item) => String(item) === String(value).trim())) {
      errors.push(`${field.name} 必须为 ${field.allowedValues.join('/')}`);
    }

    if (field.type === 'int') {
      const parsed = Number.parseInt(value, 10);
      if (field.minValue !== undefined && parsed < field.minValue) {
        errors.push(`${field.name} 不能小于 ${field.minValue}`);
      }
      if (field.maxValue !== undefined && parsed > field.maxValue) {
        errors.push(`${field.name} 不能大于 ${field.maxValue}`);
      }
    }
  }

  return errors;
}

function validateParams(options) {
  const { source = 'body', fields = [], atLeastOne = [] } = options;

  return function validateParamsMiddleware(req, res, next) {
    const data = req[source] || {};
    const errors = validateFields(data, fields);

    if (atLeastOne.length > 0 && atLeastOne.every((name) => isEmptyValue(data[name]))) {
      errors.push(`至少需要提供一个字段: ${atLeastOne.join('/')}`);
    }

    if (errors.length > 0) {
      return next(createValidationError(`参数校验失败: ${errors.join('; ')}`));
    }

    return next();
  };
}

function validateByRules(rules) {
  return function validateByRulesMiddleware(req, res, next) {
    for (const rule of rules) {
      if (!rule.when(req)) {
        continue;
      }

      const data = req[rule.source || 'body'] || {};
      const errors = validateFields(data, rule.fields || []);
      if (errors.length > 0) {
        return next(createValidationError(`参数校验失败: ${errors.join('; ')}`));
      }

      return next();
    }

    return next(createValidationError('参数校验失败: 请求参数不符合任何有效规则'));
  };
}

function validateByKey(key) {
  const config = routeValidationMap[key];
  if (!config) {
    throw new Error(`未找到校验配置: ${key}`);
  }

  if (config.type === 'rules') {
    return validateByRules(config.rules || []);
  }

  return validateParams(config);
}

module.exports = {
  validateParams,
  validateByRules,
  validateByKey
};
