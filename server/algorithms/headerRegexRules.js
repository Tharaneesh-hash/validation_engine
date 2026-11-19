/**
 * RFC 7230 & RFC 6265 Standards-Compliant Regex Rules for HTTP Headers and Cookies
 */

export const HTTP_HEADER_RULES = {
  // Header name: 1*tchar (RFC 7230 Section 3.2.6)
  headerName: {
    regex: /^[a-zA-Z0-9!#$%&'*+\-.^_`|~]+$/,
    description: 'Header name must consist of RFC 7230 token characters (alphanumeric, hyphens, and standard symbols).',
    suggestion: 'Use standard ASCII tokens without spaces, colons, or control characters (e.g. Content-Type).'
  },

  // Host header: host [ ":" port ] (RFC 7230 Section 5.4)
  Host: {
    regex: /^([a-zA-Z0-9.-]+|\[[a-fA-F0-9:]+\])(:[0-9]{1,5})?$/,
    description: 'Host header must be a valid domain name, IPv4 address, or bracketed IPv6 address with optional port (1-65535).',
    suggestion: 'Provide a valid host like "example.com" or "localhost:5000".'
  },

  // Content-Type: media-type [ *(";" parameter) ] (RFC 7231 Section 3.1.1.1)
  'Content-Type': {
    regex: /^[a-zA-Z0-9!#$%&'*+\-.^_`|~]+\/[a-zA-Z0-9!#$%&'*+\-.^_`|~]+(\s*;\s*[a-zA-Z0-9!#$%&'*+\-.^_`|~]+=(?:[a-zA-Z0-9!#$%&'*+\-.^_`|~]+|"[^"]*"))*$/,
    description: 'Content-Type must follow type/subtype with optional parameters (e.g., application/json; charset=utf-8).',
    suggestion: 'Specify a standard MIME type like "application/json" or "text/html; charset=UTF-8".'
  },

  // Content-Length: 1*DIGIT (RFC 7230 Section 3.3.2)
  'Content-Length': {
    regex: /^[0-9]+$/,
    description: 'Content-Length must be a non-negative decimal integer representing octets.',
    suggestion: 'Provide an integer count of bytes, e.g. "348".'
  },

  // Authorization: auth-scheme [ 1*SP (token68 / #auth-param) ] (RFC 7235 Section 4.2)
  Authorization: {
    regex: /^(Bearer\s+[a-zA-Z0-9\-._~+/]+=*|Basic\s+[a-zA-Z0-9+/]+=*|ApiKey\s+[a-zA-Z0-9\-_]+|[a-zA-Z0-9!#$%&'*+\-.^_`|~]+\s+.+)$/,
    description: 'Authorization header must specify an auth scheme followed by valid credentials (e.g. Bearer <token>, Basic <base64>).',
    suggestion: 'Format as "Bearer <token>" or "Basic <base64-credentials>".'
  },

  // Accept: media-range [ *( ";" parameter ) ]
  Accept: {
    regex: /^(\*|\*\/[a-zA-Z0-9*!#$%&'*+\-.^_`|~]+|[a-zA-Z0-9!#$%&'*+\-.^_`|~]+\/(\*|[a-zA-Z0-9!#$%&'*+\-.^_`|~]+))(\s*;\s*[a-zA-Z0-9!#$%&'*+\-.^_`|~]+=(?:[a-zA-Z0-9!#$%&'*+\-.^_`|~]+|"[^"]*"))*(?:\s*,\s*(\*|\*\/[a-zA-Z0-9*!#$%&'*+\-.^_`|~]+|[a-zA-Z0-9!#$%&'*+\-.^_`|~]+\/(\*|[a-zA-Z0-9!#$%&'*+\-.^_`|~]+))(\s*;\s*[a-zA-Z0-9!#$%&'*+\-.^_`|~]+=(?:[a-zA-Z0-9!#$%&'*+\-.^_`|~]+|"[^"]*"))*)*$/,
    description: 'Accept header must contain comma-separated MIME types with optional q-factors (e.g., text/html, application/xhtml+xml, application/xml;q=0.9).',
    suggestion: 'Provide accepted MIME types like "application/json, text/plain, */*".'
  },

  // User-Agent: 1*( product / RWS / comment ) (RFC 7231 Section 5.5.3)
  'User-Agent': {
    regex: /^[a-zA-Z0-9!#$%&'*+\-.^_`|~]+(\/[a-zA-Z0-9!#$%&'*+\-.^_`|~]+)?(\s+(\([^\r\n]*\)|\S+))*$/,
    description: 'User-Agent must consist of product tokens and optional parenthesized comments.',
    suggestion: 'Use a standard client identifier like "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36".'
  },

  // Origin: "null" / ( scheme "://" host [ ":" port ] ) (RFC 6454 Section 7)
  Origin: {
    regex: /^(null|https?:\/\/([a-zA-Z0-9.-]+|\[[a-fA-F0-9:]+\])(:[0-9]{1,5})?)$/,
    description: 'Origin header must be "null" or an absolute HTTP/HTTPS URL containing scheme, host, and optional port.',
    suggestion: 'Provide origin like "https://example.com" or "http://localhost:5173".'
  },

  // Referer: absolute-URI / partial-URI (RFC 7231 Section 5.5.2)
  Referer: {
    regex: /^https?:\/\/([a-zA-Z0-9.-]+|\[[a-fA-F0-9:]+\])(:[0-9]{1,5})?(\/[^\s#]*)?$/,
    description: 'Referer must be an absolute HTTP/HTTPS URI without a URI fragment (#).',
    suggestion: 'Provide the referring URL like "https://example.com/login".'
  },

  // Cache-Control (RFC 7234 Section 5.2)
  'Cache-Control': {
    regex: /^[a-zA-Z0-9\-]+(?:=[a-zA-Z0-9\-]+|="[^"]*")?(?:\s*,\s*[a-zA-Z0-9\-]+(?:=[a-zA-Z0-9\-]+|="[^"]*")?)*$/,
    description: 'Cache-Control must contain comma-separated cache directives (e.g., no-cache, no-store, max-age=3600).',
    suggestion: 'Use standard directives like "no-store, no-cache, must-revalidate" or "public, max-age=86400".'
  },

  // X-Content-Type-Options (RFC / Standard)
  'X-Content-Type-Options': {
    regex: /^nosniff$/i,
    description: 'X-Content-Type-Options header must strictly be "nosniff" to prevent MIME-type confusion attacks.',
    suggestion: 'Set to "nosniff".'
  },

  // X-Frame-Options (RFC 7034)
  'X-Frame-Options': {
    regex: /^(DENY|SAMEORIGIN|ALLOW-FROM\s+https?:\/\/[a-zA-Z0-9.-]+(:[0-9]{1,5})?)$/i,
    description: 'X-Frame-Options must be DENY, SAMEORIGIN, or ALLOW-FROM <uri> to defend against clickjacking.',
    suggestion: 'Set to "DENY" or "SAMEORIGIN".'
  },

  // Strict-Transport-Security (RFC 6797)
  'Strict-Transport-Security': {
    regex: /^max-age=[0-9]+(?:\s*;\s*includeSubDomains)?(?:\s*;\s*preload)?$/i,
    description: 'HSTS header must specify max-age in seconds with optional includeSubDomains and preload directives.',
    suggestion: 'Set to "max-age=31536000; includeSubDomains".'
  },

  // Content-Security-Policy (W3C Recommendation)
  'Content-Security-Policy': {
    regex: /^[a-zA-Z0-9\-]+\s+[^;]+(?:\s*;\s*[a-zA-Z0-9\-]+\s+[^;]+)*\s*;?$/,
    description: 'Content-Security-Policy must consist of semicolon-separated directive name and source-list pairs.',
    suggestion: 'Example: "default-src \'self\'; script-src \'self\' https://trusted.cdn.com".'
  }
};

export const COOKIE_RULES = {
  // Cookie Name: 1*<any CHAR except CTLs or separators> (RFC 6265 Section 4.1.1)
  cookieName: {
    regex: /^[a-zA-Z0-9!#$%&'*+\-.^_`|~]+$/,
    description: 'Cookie name must consist of US-ASCII characters excluding control characters, whitespace, and separators ((), <>, @, ;, :, ", /, [], ?, =, {}, etc.).',
    suggestion: 'Use a clean alphanumeric cookie name like "session_id", "auth_token", or "user_pref".'
  },

  // Cookie Value: *cookie-octet / ( DQUOTE *cookie-octet DQUOTE ) (RFC 6265 Section 4.1.1)
  cookieValue: {
    regex: /^([a-zA-Z0-9!#$%&'()*+\-./:<=>?@\[\]^_`{|}~]+|"[a-zA-Z0-9!#$%&'()*+\-./:<=>?@\[\]^_`{|}~]*")$/,
    description: 'Cookie value must consist of printable ASCII characters (excluding CTLs, whitespace, double quotes, commas, semicolons, backslashes), or be enclosed in double quotes.',
    suggestion: 'Use a base64, hexadecimal, or UUID string without spaces or semicolons.'
  },

  // Session ID format: secure high-entropy token (32-128 hex/alphanumeric/base64url chars)
  sessionId: {
    regex: /^[a-zA-Z0-9\-_]{16,128}$/,
    description: 'Session ID must be a high-entropy string of at least 16 characters containing letters, numbers, hyphens, or underscores.',
    suggestion: 'Generate a cryptographic random token using crypto.randomBytes(32).toString("hex").'
  },

  // Domain attribute: subdomain / IP (RFC 6265 Section 4.1.2.3)
  domain: {
    regex: /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
    description: 'Domain attribute must be a valid domain name without a leading dot or scheme.',
    suggestion: 'Set as "example.com" or "api.example.com".'
  },

  // Path attribute: path-absolute (RFC 6265 Section 4.1.2.4)
  path: {
    regex: /^\/[a-zA-Z0-9\-._~!$&'()*+,;=:@%/]*$/,
    description: 'Path attribute must begin with a forward slash "/" representing an absolute path.',
    suggestion: 'Set as "/" for site-wide access or "/api" for backend routes.'
  },

  // SameSite attribute: Strict | Lax | None (RFC 6265bis)
  sameSite: {
    regex: /^(Strict|Lax|None)$/i,
    description: 'SameSite attribute must strictly be "Strict", "Lax", or "None".',
    suggestion: 'Use "Strict" for sensitive cookies, "Lax" for general web browsing, or "None" with Secure.'
  },

  // Max-Age attribute: 1*DIGIT (RFC 6265 Section 4.1.2.2)
  maxAge: {
    regex: /^-?[0-9]+$/,
    description: 'Max-Age attribute must be an integer count of seconds.',
    suggestion: 'Set to a positive integer in seconds (e.g., 3600 for 1 hour, 86400 for 1 day).'
  },

  // Expires attribute: rfc1123-date (RFC 6265 Section 4.1.1)
  expires: {
    regex: /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s+[0-9]{2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+[0-9]{4}\s+[0-9]{2}:[0-9]{2}:[0-9]{2}\s+GMT$/,
    description: 'Expires attribute must be an RFC 1123 HTTP-date format (e.g. Wed, 21 Oct 2026 07:28:00 GMT).',
    suggestion: 'Format as "Wed, 21 Oct 2026 07:28:00 GMT" (use Date.toUTCString()).'
  }
};

/**
 * Validates a single HTTP header name and value
 */
export function validateHttpHeader(name, value) {
  const warnings = [];
  const errors = [];

  // 1. Validate header name
  const nameRule = HTTP_HEADER_RULES.headerName;
  const isNameValid = nameRule.regex.test(name);
  if (!isNameValid) {
    errors.push({
      field: 'headerName',
      value: name,
      message: 'Invalid HTTP header name syntax.',
      suggestion: nameRule.suggestion
    });
  }

  // 2. Check for newline injection (CRLF injection / HTTP Response Splitting)
  if (/[\r\n]/.test(value)) {
    errors.push({
      field: 'headerValue',
      value: '[MALFORMED_CRLF]',
      message: 'CRLF injection vulnerability detected! Header value contains carriage return or line feed characters.',
      suggestion: 'Strip all \\r and \\n characters from header values.'
    });
  }

  // 3. Header-specific validation
  const rule = HTTP_HEADER_RULES[name];
  let isValueValid = true;

  if (rule) {
    isValueValid = rule.regex.test(value);
    if (!isValueValid) {
      errors.push({
        field: 'headerValue',
        header: name,
        value,
        message: rule.description,
        suggestion: rule.suggestion
      });
    }
  }

  // 4. Suspicious header values / security alerts
  if (name.toLowerCase() === 'authorization' && !value.toLowerCase().startsWith('bearer ') && !value.toLowerCase().startsWith('basic ')) {
    warnings.push({
      header: name,
      message: 'Authorization header uses an unrecognized scheme.',
      suggestion: 'Use Bearer or Basic authentication.'
    });
  }

  if (name.toLowerCase() === 'user-agent' && (value.toLowerCase().includes('sqlmap') || value.toLowerCase().includes('nikto') || value.toLowerCase().includes('nmap'))) {
    warnings.push({
      header: name,
      message: 'Suspicious scanner User-Agent detected (potential penetration testing probe).',
      suggestion: 'Block or rate-limit suspicious automated vulnerability scanning user agents.'
    });
  }

  return {
    name,
    value,
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Parses and validates an HTTP Set-Cookie or Cookie string
 */
export function validateCookieString(cookieString, isSetCookie = true) {
  if (!cookieString || typeof cookieString !== 'string') {
    return {
      isValid: false,
      errors: [{ message: 'Cookie string is empty or invalid.' }],
      warnings: [],
      cookieData: null
    };
  }

  const errors = [];
  const warnings = [];

  // Parse key-value and attributes
  const parts = cookieString.split(';').map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) {
    return {
      isValid: false,
      errors: [{ message: 'No cookie parts found in cookie header.' }],
      warnings: [],
      cookieData: null
    };
  }

  const firstPart = parts[0];
  const eqIdx = firstPart.indexOf('=');
  let name = firstPart;
  let value = '';

  if (eqIdx !== -1) {
    name = firstPart.substring(0, eqIdx).trim();
    value = firstPart.substring(eqIdx + 1).trim();
  }

  // Validate Name & Value
  if (!COOKIE_RULES.cookieName.regex.test(name)) {
    errors.push({
      field: 'name',
      value: name,
      message: COOKIE_RULES.cookieName.description,
      suggestion: COOKIE_RULES.cookieName.suggestion
    });
  }

  if (!COOKIE_RULES.cookieValue.regex.test(value)) {
    errors.push({
      field: 'value',
      value: value.length > 20 ? value.substring(0, 20) + '...' : value,
      message: COOKIE_RULES.cookieValue.description,
      suggestion: COOKIE_RULES.cookieValue.suggestion
    });
  }

  const attributes = {
    domain: null,
    path: null,
    expires: null,
    maxAge: null,
    secure: false,
    httpOnly: false,
    sameSite: null
  };

  // Process attributes if Set-Cookie
  if (isSetCookie) {
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const attrEq = part.indexOf('=');
      const attrName = (attrEq !== -1 ? part.substring(0, attrEq) : part).trim().toLowerCase();
      const attrVal = (attrEq !== -1 ? part.substring(attrEq + 1) : '').trim();

      if (attrName === 'secure') {
        attributes.secure = true;
      } else if (attrName === 'httponly') {
        attributes.httpOnly = true;
      } else if (attrName === 'domain') {
        attributes.domain = attrVal;
        if (!COOKIE_RULES.domain.regex.test(attrVal)) {
          errors.push({
            field: 'Domain',
            value: attrVal,
            message: COOKIE_RULES.domain.description,
            suggestion: COOKIE_RULES.domain.suggestion
          });
        }
      } else if (attrName === 'path') {
        attributes.path = attrVal;
        if (!COOKIE_RULES.path.regex.test(attrVal)) {
          errors.push({
            field: 'Path',
            value: attrVal,
            message: COOKIE_RULES.path.description,
            suggestion: COOKIE_RULES.path.suggestion
          });
        }
      } else if (attrName === 'samesite') {
        attributes.sameSite = attrVal;
        if (!COOKIE_RULES.sameSite.regex.test(attrVal)) {
          errors.push({
            field: 'SameSite',
            value: attrVal,
            message: COOKIE_RULES.sameSite.description,
            suggestion: COOKIE_RULES.sameSite.suggestion
          });
        }
      } else if (attrName === 'max-age') {
        attributes.maxAge = parseInt(attrVal, 10);
        if (isNaN(attributes.maxAge)) {
          errors.push({
            field: 'Max-Age',
            value: attrVal,
            message: 'Max-Age must be a valid integer.',
            suggestion: COOKIE_RULES.maxAge.suggestion
          });
        }
      } else if (attrName === 'expires') {
        attributes.expires = attrVal;
        if (!COOKIE_RULES.expires.regex.test(attrVal)) {
          warnings.push({
            field: 'Expires',
            value: attrVal,
            message: 'Expires header should adhere to RFC 1123 GMT date format.',
            suggestion: COOKIE_RULES.expires.suggestion
          });
        }
      }
    }

    // Security Checks for Set-Cookie
    if (!attributes.httpOnly) {
      warnings.push({
        severity: 'HIGH',
        message: 'Missing HttpOnly flag. The cookie can be read by client-side JavaScript, increasing XSS vulnerability risk.',
        suggestion: 'Add "; HttpOnly" to prevent script access.'
      });
    }

    if (!attributes.secure) {
      warnings.push({
        severity: 'HIGH',
        message: 'Missing Secure flag. The cookie can be transmitted over unencrypted HTTP channels in plaintext.',
        suggestion: 'Add "; Secure" to ensure transmission only over HTTPS.'
      });
    }

    if (!attributes.sameSite) {
      warnings.push({
        severity: 'MEDIUM',
        message: 'Missing SameSite attribute. The cookie is susceptible to Cross-Site Request Forgery (CSRF).',
        suggestion: 'Add "; SameSite=Strict" or "; SameSite=Lax".'
      });
    } else if (attributes.sameSite.toLowerCase() === 'none' && !attributes.secure) {
      errors.push({
        severity: 'CRITICAL',
        field: 'SameSite',
        message: 'SameSite=None requires the Secure attribute to be present.',
        suggestion: 'Add "; Secure" when using SameSite=None.'
      });
    }
  }

  // Check if session ID cookie
  const isSessionCookie = /^(session|session_id|sessid|sid|auth_token|token|jwt)/i.test(name);
  if (isSessionCookie) {
    if (!COOKIE_RULES.sessionId.regex.test(value.replace(/^"|"$/g, ''))) {
      warnings.push({
        severity: 'MEDIUM',
        field: 'sessionId',
        message: 'Session token has low entropy or unusual character structure.',
        suggestion: 'Use a cryptographically random session token (32+ characters).'
      });
    }
  }

  return {
    name,
    value: isSessionCookie && value.length > 8 ? value.substring(0, 4) + '...' + value.substring(value.length - 4) : value,
    rawLength: value.length,
    isSessionCookie,
    attributes,
    isValid: errors.length === 0,
    hasSecurityWarnings: warnings.length > 0,
    errors,
    warnings
  };
}
