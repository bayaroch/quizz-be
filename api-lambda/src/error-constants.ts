export const errors = {
  not_found: { code: 'BE00001', message: 'No found' },
  unauthorized: { code: 'BE00002', message: 'Unauthorized' },
  user_model_related_error: {
    code: 'BE00003',
    message: 'User model related error',
  },
  no_update_parameters_provided: {
    code: 'BE00004',
    message: 'No update parameters provided',
  },
  google_api: { code: 'BE00005', message: 'Gooogle API error' },
  not_received: { code: 'BE00006', message: 'Error retrieving data' },
  limit_must_be_greater_than_or_equal_to_1: {
    code: 'BE00007',
    message: 'Limit must be greater than or equal to 1',
  },
  quiz_model_related_error: {
    code: 'BE00008',
    message: 'Quiz model related error',
  },
  result_model_related_error: {
    code: 'BE00009',
    message: 'Result model related error',
  },
  invalid_limit: {
    code: 'BE00010',
    message: 'Invalid limit value: must be -1 or a positive integer',
  },
};
