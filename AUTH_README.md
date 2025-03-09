# Email-Based Authentication

This application is configured to use Azure App Service Authentication with Google as the identity provider. The application restricts access to specific approved email addresses.

## How it works

1. **Azure App Service Authentication**: 
   - The application is deployed on Azure App Service with Authentication enabled
   - Google is configured as the identity provider
   - When a user visits the application, they are redirected to Google for authentication

2. **Email Restriction**:
   - After successful authentication, Azure App Service adds an authentication header (`x-ms-client-principal`) to the request
   - Our Next.js middleware intercepts this header and extracts the user's email address
   - The middleware checks if the email is in the allowed list
   - If not, the user is redirected to an "Unauthorized" page

## Allowed Email Addresses

Currently, the following email addresses are allowed to access the application:

- service@jvc-co.be
- alvarolj23@gmail.com

## How to Add New Email Addresses

To add a new email address to the allowed list:

1. Open `src/middleware.ts`
2. Add the new email to the `ALLOWED_EMAILS` array
3. Rebuild and redeploy the application

```typescript
// List of allowed emails
const ALLOWED_EMAILS = [
  'service@jvc-co.be',
  'alvarolj23@gmail.com',
  // Add new emails here
  'newemail@example.com'
];
```

## Troubleshooting

The middleware includes logging to help with debugging authentication issues:

- If a user doesn't have the authentication header, they'll be redirected to Google for login
- If a user has authenticated but their email is not in the allowed list, they'll see the Unauthorized page
- Check the application logs for detailed authentication information

### Common Issues

- **User not redirected to login**: Make sure Azure App Service Authentication is properly configured
- **User seeing Unauthorized page**: Check if their email address is in the allowed list
- **Authentication header not found**: Verify Azure App Service Authentication settings 