const routeValidationMap = {
  'POST /auth/login': {
    source: 'body',
    fields: [
      { name: 'name', type: 'string', required: true },
      { name: 'password', type: 'string', required: true }
    ]
  },
  'GET /user/list': {
    source: 'query',
    fields: [
      { name: 'offset', type: 'int', required: true, minValue: 1 },
      { name: 'limits', type: 'int', required: true, minValue: 1, maxValue: 100 },
      { name: 'search', type: 'string', required: false }
    ]
  },
  'GET /user/detail': {
    source: 'query',
    fields: [{ name: 'id', type: 'int', required: true, minValue: 1 }]
  },
  'POST /user/add': {
    source: 'body',
    fields: [
      { name: 'name', type: 'string', required: true, minLength: 1, maxLength: 191 },
      { name: 'password', type: 'string', required: true, minLength: 6, maxLength: 72 },
      { name: 'email', type: 'email', required: true, maxLength: 191 },
      { name: 'admin', type: 'int', required: true, allowedValues: [0, 1] }
    ]
  },
  'POST /user/update': {
    source: 'body',
    atLeastOne: ['name', 'password', 'email', 'admin'],
    fields: [
      { name: 'id', type: 'int', required: true, minValue: 1 },
      { name: 'name', type: 'string', required: false, minLength: 1, maxLength: 191 },
      { name: 'password', type: 'string', required: false, minLength: 6, maxLength: 72 },
      { name: 'email', type: 'email', required: false, maxLength: 191 },
      { name: 'admin', type: 'int', required: false, allowedValues: [0, 1] }
    ]
  },
  'POST /user/delete': {
    source: 'body',
    fields: [{ name: 'id', type: 'array[int]', required: true }]
  },
  'GET /article/list': {
    source: 'query',
    fields: [
      { name: 'offset', type: 'int', required: true },
      { name: 'limits', type: 'int', required: true },
      { name: 'search', type: 'string', required: false }
    ]
  },
  'GET /article/detail': {
    source: 'query',
    fields: [{ name: 'a_id', type: 'int', required: true }]
  },
  'POST /article/add': {
    source: 'body',
    fields: [
      { name: 'title', type: 'string', required: true },
      { name: 'content', type: 'string', required: true },
      { name: 'cover', type: 'string', required: false },
      { name: 'category', type: 'int', required: false },
      { name: 'status', type: 'int', required: false }
    ]
  },
  'POST /article/update': {
    source: 'body',
    fields: [
      { name: 'a_id', type: 'int', required: true },
      { name: 'title', type: 'string', required: false },
      { name: 'content', type: 'string', required: false },
      { name: 'cover', type: 'string', required: false },
      { name: 'category', type: 'int', required: false },
      { name: 'status', type: 'int', required: false }
    ]
  },
  'POST /article/delete': {
    source: 'body',
    fields: [{ name: 'id', type: 'array[int]', required: true }]
  },
  'POST /comment/add': {
    source: 'body',
    fields: [
      { name: 'a_id', type: 'int', required: true },
      { name: 'parent_id', type: 'int', required: true },
      { name: 'is_regist', type: 'int', required: true },
      { name: 'user_name', type: 'string', required: true },
      { name: 'email', type: 'string', required: true },
      { name: 'url', type: 'string', required: false },
      { name: 'text', type: 'string', required: true }
    ]
  },
  'GET /comment/list': {
    source: 'query',
    fields: [
      { name: 'offset', type: 'int', required: true },
      { name: 'limits', type: 'int', required: true },
      { name: 'a_id', type: 'int', required: true }
    ]
  },
  'GET /comment/admin-list': {
    source: 'query',
    fields: [
      { name: 'offset', type: 'int', required: true },
      { name: 'limits', type: 'int', required: true },
      { name: 'search', type: 'string', required: false }
    ]
  },
  'POST /comment/delete': {
    source: 'body',
    fields: [{ name: 'id', type: 'array[int]', required: true }]
  },
  'POST /comment/update': {
    source: 'body',
    fields: [
      { name: 'id', type: 'int', required: true },
      { name: 'status', type: 'int', required: true }
    ]
  },
  'POST /friendlink/add': {
    source: 'body',
    fields: [
      { name: 'name', type: 'string', required: true, minLength: 1, maxLength: 100 },
      {
        name: 'url',
        type: 'friendlinkUrl',
        required: true,
        maxLength: 2048,
        typeMessage: 'url 必须为 https://主域名或二级域名/ 格式'
      }
    ]
  },
  'GET /friendlink/list': {
    source: 'query',
    fields: [
      { name: 'offset', type: 'int', required: true, minValue: 1 },
      { name: 'limits', type: 'int', required: true, minValue: 1, maxValue: 100 }
    ]
  },
  'GET /friendlink/admin-list': {
    source: 'query',
    fields: [
      { name: 'offset', type: 'int', required: true, minValue: 1 },
      { name: 'limits', type: 'int', required: true, minValue: 1, maxValue: 100 },
      { name: 'search', type: 'string', required: false }
    ]
  },
  'POST /friendlink/update': {
    source: 'body',
    atLeastOne: ['name', 'url', 'status', 'sort'],
    fields: [
      { name: 'id', type: 'int', required: true, minValue: 1 },
      { name: 'name', type: 'string', required: false, minLength: 1, maxLength: 100 },
      {
        name: 'url',
        type: 'friendlinkUrl',
        required: false,
        maxLength: 2048,
        typeMessage: 'url 必须为 https://主域名或二级域名/ 格式'
      },
      { name: 'status', type: 'int', required: false, allowedValues: [0, 1, 2] },
      { name: 'sort', type: 'int', required: false }
    ]
  },
  'POST /friendlink/delete': {
    source: 'body',
    fields: [{ name: 'id', type: 'array[int]', required: true }]
  },
  'GET /dict/list': {
    source: 'query',
    fields: [
      { name: 'offset', type: 'int', required: true },
      { name: 'limits', type: 'int', required: true },
      { name: 'search', type: 'string', required: false }
    ]
  },
  'GET /dict/findbytype': {
    source: 'query',
    fields: [
      { name: 'offset', type: 'int', required: true },
      { name: 'limits', type: 'int', required: true },
      { name: 'dict_type', type: 'string', required: true }
    ]
  },
  'POST /dict/add': {
    source: 'body',
    fields: [
      { name: 'dict_type', type: 'string', required: true },
      { name: 'name', type: 'string', required: true },
      { name: 'value', type: 'int', required: true }
    ]
  },
  'POST /dict/update': {
    type: 'rules',
    rules: [
      {
        when: (req) => req.body && req.body.id !== undefined && req.body.id !== null && req.body.id !== '',
        source: 'body',
        fields: [
          { name: 'id', type: 'int', required: true },
          { name: 'dict_type', type: 'string', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'value', type: 'int', required: true }
        ]
      },
      {
        when: () => true,
        source: 'body',
        fields: [
          { name: 'dict_type', type: 'string', required: true },
          { name: 'update_dict_type', type: 'string', required: true }
        ]
      }
    ]
  },
  'POST /dict/delete': {
    type: 'rules',
    rules: [
      {
        when: (req) => req.body && Object.prototype.hasOwnProperty.call(req.body, 'id'),
        source: 'body',
        fields: [{ name: 'id', type: 'array[int]', required: true }]
      },
      {
        when: (req) => req.body && Object.prototype.hasOwnProperty.call(req.body, 'dict_type'),
        source: 'body',
        fields: [{ name: 'dict_type', type: 'array[string]', required: true }]
      }
    ]
  }
};

module.exports = routeValidationMap;
