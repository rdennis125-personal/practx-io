(function () {
  const form = document.getElementById('signup-form');
  if (!form) return;

  const alertBox = document.getElementById('form-alert');

  function showAlert(message, isError) {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.classList.toggle('error', Boolean(isError));
    alertBox.classList.add('show');
  }

  const REQUIRED_ATTRIBUTES = ['elmPilotUser', 'elmDefaultOrgMembership', 'elmOrgMemberships'];

  const DEFAULT_CONFIG = {
    userFlow: 'SWA',
    redirectPath: '/welcome',
    userAttributes: [
      'City',
      'Country',
      'DisplayName',
      'Email',
      'GivenName',
      'JobTitle',
      'PostalCode',
      'State',
      'StreetAddress',
      'Surname',
      'elmPilotUser',
      'elmDefaultOrgMembership',
      'elmOrgMemberships'
    ],
    defaultAttributeValues: {
      elmPilotUser: 'true'
    }
  };

  function resolveConfig() {
    const globalConfig = window.practxSwaSignupConfig || {};

    const rawAttributes = globalConfig.userAttributes ?? DEFAULT_CONFIG.userAttributes;
    const attributeList = Array.isArray(rawAttributes)
      ? rawAttributes
      : String(rawAttributes || '')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean);

    const attributes = attributeList.length ? attributeList.slice() : DEFAULT_CONFIG.userAttributes.slice();
    REQUIRED_ATTRIBUTES.forEach((requiredAttribute) => {
      if (!attributes.some((attr) => attr && attr.toLowerCase() === requiredAttribute.toLowerCase())) {
        attributes.push(requiredAttribute);
      }
    });

    const defaults = Object.assign({}, DEFAULT_CONFIG.defaultAttributeValues);
    if (globalConfig.defaultAttributeValues && typeof globalConfig.defaultAttributeValues === 'object') {
      Object.keys(globalConfig.defaultAttributeValues).forEach((key) => {
        const value = globalConfig.defaultAttributeValues[key];
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          defaults[key] = value;
        }
      });
    }

    const userFlow = String(globalConfig.userFlow || DEFAULT_CONFIG.userFlow || '').trim();

    const redirectCandidate =
      globalConfig.redirectUri || globalConfig.redirectPath || DEFAULT_CONFIG.redirectPath || '/welcome';

    let redirectUri;
    try {
      redirectUri = new URL(redirectCandidate, window.location.origin).toString();
    } catch (error) {
      redirectUri = new URL('/welcome', window.location.origin).toString();
    }

    return {
      userFlow,
      redirectUri,
      userAttributes: attributes,
      defaultAttributeValues: defaults
    };
  }

  const signupConfig = resolveConfig();

  const COOKIE_NAME = 'practx_uid';

  function getCookie(name) {
    return document.cookie
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${name}=`))
      ?.split('=')[1];
  }

  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
  }

  function getUserToken() {
    let token = getCookie(COOKIE_NAME);
    if (!token) {
      token = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setCookie(COOKIE_NAME, token, 365);
    }
    return token;
  }

  function toHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  function fallbackHash(text) {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return `fnv1a:${(hash >>> 0).toString(16).padStart(8, '0')}`;
  }

  async function hashText(text) {
    if (window.crypto?.subtle?.digest) {
      try {
        const buffer = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
        return `sha256:${toHex(buffer)}`;
      } catch (error) {
        // fall through to fallback hash
      }
    }
    return fallbackHash(text);
  }

  function splitName(fullName) {
    const parts = String(fullName || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (parts.length === 0) {
      return { first: '', last: '' };
    }
    if (parts.length === 1) {
      return { first: parts[0], last: '' };
    }
    return { first: parts[0], last: parts.slice(1).join(' ') };
  }

  function encodeState(value) {
    try {
      const json = JSON.stringify(value);
      return btoa(unescape(encodeURIComponent(json)));
    } catch (error) {
      console.warn('Unable to encode signup state payload', error);
      return null;
    }
  }

  function buildAttributeParam(attributeNames, ...defaultMaps) {
    const normalizedDefaults = new Map();

    defaultMaps.forEach((map) => {
      if (!map || typeof map !== 'object') return;
      Object.keys(map).forEach((key) => {
        const value = map[key];
        if (value === undefined || value === null) return;
        const stringValue = typeof value === 'boolean' ? (value ? 'true' : 'false') : String(value).trim();
        if (!stringValue) return;
        const lowerKey = key.toLowerCase();
        normalizedDefaults.set(lowerKey, { key, value: stringValue });
      });
    });

    const seen = new Set();
    const segments = [];

    attributeNames.forEach((raw) => {
      const attribute = String(raw || '').trim();
      if (!attribute) return;
      const lowerKey = attribute.toLowerCase();
      if (seen.has(lowerKey)) return;
      seen.add(lowerKey);

      const defaultEntry = normalizedDefaults.get(lowerKey);
      if (defaultEntry) {
        segments.push(`${attribute}:${encodeURIComponent(defaultEntry.value)}`);
        normalizedDefaults.delete(lowerKey);
      } else {
        segments.push(attribute);
      }
    });

    normalizedDefaults.forEach((entry, lowerKey) => {
      if (seen.has(lowerKey)) return;
      const fallbackName = attributeNames.find((name) => String(name).toLowerCase() === lowerKey) || entry.key;
      segments.push(`${fallbackName}:${encodeURIComponent(entry.value)}`);
    });

    return segments.length ? segments.join(',') : '';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (form.website && form.website.value.trim() !== '') {
      showAlert('Submission failed. Please try again.', true);
      return;
    }

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const company = form.company.value.trim();
    const interest = form.interest.value;

    if (name.length < 3) {
      showAlert('Please provide your full name.', true);
      form.name.focus();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showAlert('Please provide a valid email address.', true);
      form.email.focus();
      return;
    }

    showAlert('Redirecting you to the secure signup flow…');

    const userToken = getUserToken();
    const submitterIdentity = (() => {
      if (!event.submitter) return 'unknown';
      return (
        event.submitter.dataset?.trackingId ||
        event.submitter.id ||
        event.submitter.name ||
        event.submitter.value ||
        event.submitter.textContent?.trim() ||
        'anonymous'
      );
    })();

    const interactionSource = `${window.location.pathname}::${submitterIdentity}`;

    const [userHash, interactionHash] = await Promise.all([
      hashText(userToken),
      hashText(interactionSource)
    ]);

    const { first, last } = splitName(name);

    const dynamicDefaults = {
      DisplayName: name,
      displayName: name,
      GivenName: first,
      givenName: first,
      Surname: last,
      surname: last,
      Email: email,
      email: email,
      EmailAddress: email,
      emailAddress: email,
      EmailAddresses: email
    };

    const attributeParam = buildAttributeParam(
      signupConfig.userAttributes,
      signupConfig.defaultAttributeValues,
      dynamicDefaults
    );

    const statePayload = encodeState({
      interest,
      company: company || undefined,
      source: submitterIdentity,
      path: window.location.pathname,
      userHash,
      interactionHash
    });

    const authOptions = {
      redirectUri: signupConfig.redirectUri,
      userAttributes: attributeParam || undefined,
      state: statePayload || undefined,
      userFlow: signupConfig.userFlow
    };

    if (typeof window.practxTriggerAuthFlow === 'function') {
      window.practxTriggerAuthFlow(authOptions);
      return;
    }

    const loginUrl = new URL('/.auth/login/practx', window.location.origin);
    if (signupConfig.userFlow) {
      loginUrl.searchParams.set('user_flow', signupConfig.userFlow);
    }
    loginUrl.searchParams.set('post_login_redirect_uri', signupConfig.redirectUri);
    if (attributeParam) {
      loginUrl.searchParams.set('userAttributes', attributeParam);
    }
    if (statePayload) {
      loginUrl.searchParams.set('state', statePayload);
    }

    window.location.assign(loginUrl.toString());
  });
})();

