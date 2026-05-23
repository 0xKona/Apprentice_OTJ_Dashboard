export const amplifyConfig = {
  auth: {
    user_pool_id: process.env.NEXT_PUBLIC_USER_POOL_ID!,
    aws_region: process.env.NEXT_PUBLIC_AWS_REGION!,
    user_pool_client_id: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!,
    mfa_methods: [],
    standard_required_attributes: ["email"],
    username_attributes: ["email"],
    user_verification_types: ["email"],
    mfa_configuration: "NONE",
    password_policy: {
      min_length: 8,
      require_lowercase: true,
      require_numbers: true,
      require_symbols: true,
      require_uppercase: true,
    },
  },
  data: {
    url: process.env.NEXT_PUBLIC_API_URL!,
    aws_region: process.env.NEXT_PUBLIC_AWS_REGION!,
    default_authorization_type: "AMAZON_COGNITO_USER_POOLS",
    authorization_types: ["AWS_IAM"],
  },
  version: "1.3",
};
