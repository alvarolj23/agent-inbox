import { NextRequest, NextResponse } from 'next/server';

// List of allowed emails
const ALLOWED_EMAILS = [
  'service@jvc-co.be',
  'alvarolj23@gmail.com'
];

export async function middleware(request: NextRequest) {
  // Skip authentication check for the unauthorized page
  if (request.nextUrl.pathname === '/unauthorized') {
    return NextResponse.next();
  }

  // Get the authentication headers that come from Azure App Service
  const msClientPrincipalHeader = request.headers.get('x-ms-client-principal');
  
  // If header is not present, user is not authenticated
  // Azure will handle the actual authentication redirection
  if (!msClientPrincipalHeader) {
    console.log('No x-ms-client-principal header found. User not authenticated yet.');
    return NextResponse.next();
  }

  try {
    // The header is base64 encoded
    const decodedHeader = Buffer.from(msClientPrincipalHeader, 'base64').toString('utf-8');
    const principal = JSON.parse(decodedHeader);
    
    // Log authentication data for debugging (avoid in production unless needed)
    console.log('Auth principal data:', {
      identityProvider: principal.identityProvider,
      userId: principal.userId,
      claimsCount: principal.claims?.length || 0
    });
    
    // Get the email from the claims
    // Azure AD B2C with Google as provider sends the email in claims array
    const emailClaim = principal.claims?.find((claim: any) => 
      claim.typ === 'emails' || claim.typ === 'email' || claim.typ === 'preferred_username'
    );
    
    const email = emailClaim?.val;
    console.log('Authenticated user email:', email);
    
    // If no email found or email is not in allowed list
    if (!email) {
      console.warn('No email found in auth claims');
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    if (!ALLOWED_EMAILS.includes(email.toLowerCase())) {
      console.log(`Access denied for email: ${email} - Not in allowed list`);
      // Redirect to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    console.log(`Access granted for authorized email: ${email}`);
    // User is authenticated and email is allowed, proceed with the request
    return NextResponse.next();
  } catch (error) {
    console.error('Error parsing authentication header:', error);
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
}

// Run middleware on all routes except for public assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/health (health check API)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images)
     */
    '/((?!api/health|_next/static|_next/image|favicon.ico|images/).*)',
  ],
}; 