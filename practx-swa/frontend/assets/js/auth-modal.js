(function () {
  const PROVIDER_PATH = '/.auth/login/practx';
  const DEFAULT_REDIRECT = '/welcome';

  function resolveConfig() {
    const config = window.practxSwaSignupConfig || {};
    const redirectCandidate = config.redirectUri || config.redirectPath || DEFAULT_REDIRECT;
    let redirectUri;

    try {
      redirectUri = new URL(redirectCandidate, window.location.origin).toString();
    } catch (error) {
      redirectUri = new URL(DEFAULT_REDIRECT, window.location.origin).toString();
    }

    return {
      userFlow: config.userFlow || 'SWA',
      redirectUri
    };
  }

  function encodeState(value) {
    if (!value) {
      return null;
    }

    if (typeof value === 'string') {
      return value;
    }

    try {
      const json = JSON.stringify(value);
      return btoa(unescape(encodeURIComponent(json)));
    } catch (error) {
      console.warn('Unable to encode auth state', error);
      return null;
    }
  }

  function buildAuthUrl(options) {
    const config = resolveConfig();
    const loginUrl = new URL(PROVIDER_PATH, window.location.origin);
    const opts = options || {};

    const redirectCandidate = opts.redirectUri || opts.redirectPath || config.redirectUri;
    try {
      loginUrl.searchParams.set('post_login_redirect_uri', new URL(redirectCandidate, window.location.origin).toString());
    } catch (error) {
      loginUrl.searchParams.set('post_login_redirect_uri', config.redirectUri);
    }

    const userFlow = opts.userFlow || config.userFlow;
    if (userFlow) {
      loginUrl.searchParams.set('user_flow', userFlow);
    }

    if (opts.userAttributes) {
      loginUrl.searchParams.set('userAttributes', opts.userAttributes);
    }

    const state = encodeState(opts.state);
    if (state) {
      loginUrl.searchParams.set('state', state);
    }

    return loginUrl.toString();
  }

  function triggerAuthFlow(options) {
    const url = buildAuthUrl(options);
    window.location.assign(url);
  }

  function buildStatePayload(element) {
    const textContent = element.textContent ? element.textContent.trim() : '';
    const source = element.getAttribute('data-auth-source') || element.id || textContent || 'unknown';
    const interest = element.getAttribute('data-auth-interest');
    const area = element.getAttribute('data-auth-area');

    const payload = {
      source: source,
      path: window.location.pathname
    };

    if (interest) {
      payload.interest = interest;
    }
    if (area) {
      payload.area = area;
    }

    return payload;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var triggers = document.querySelectorAll('[data-auth-source]');
    triggers.forEach(function (element) {
      element.addEventListener('click', function (event) {
        if (element.dataset && element.dataset.authBypass === 'true') {
          return;
        }
        event.preventDefault();

        const options = {
          redirectUri: element.getAttribute('data-auth-redirect') || undefined,
          state: buildStatePayload(element)
        };

        const userFlow = element.getAttribute('data-auth-flow') || element.getAttribute('data-auth-user-flow');
        if (userFlow) {
          options.userFlow = userFlow;
        }

        const userAttributes = element.getAttribute('data-auth-attributes');
        if (userAttributes) {
          options.userAttributes = userAttributes;
        }

        triggerAuthFlow(options);
      });
    });
  });

  window.practxBuildAuthUrl = buildAuthUrl;
  window.practxTriggerAuthFlow = triggerAuthFlow;
})();
