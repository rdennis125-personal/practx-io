(function () {
  const COOKIE_NAME = 'practx_uid';
  const API_PREFIX = '/api';
  const apiBaseOverride = (() => {
    if (typeof window === 'undefined') return '';
    const value = window.PRACTX_MARKETING_SWA__API_BASE_URL;
    if (typeof value !== 'string') return '';
    return value.trim().replace(/\/$/, '');
  })();
  const HELLO_WORLD_ROUTE = apiBaseOverride ? `${apiBaseOverride}/hello-world` : `${API_PREFIX}/hello-world`;

  const form = document.getElementById('signup-form');
  const formAlert = document.getElementById('form-alert');
  const helloButton = document.getElementById('hello-button');
  const helloAlert = document.getElementById('hello-alert');

  function renderAlert(node, message, isError) {
    if (!node) return;
    node.textContent = message;
    node.classList.toggle('error', Boolean(isError));
    node.classList.add('show');
  }

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
        // fall back to the lightweight hash implementation
      }
    }
    return fallbackHash(text);
  }

  async function getEntitlement() {
    try {
      return await hashText(getUserToken());
    } catch (error) {
      console.warn('Unable to derive practx entitlement hash', error);
      return null;
    }
  }

  function initSignupForm() {
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (form.website && form.website.value.trim() !== '') {
        renderAlert(formAlert, 'Submission failed. Please try again.', true);
        return;
      }

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const company = form.company.value.trim();
      const interest = form.interest.value;

      if (name.length < 3) {
        renderAlert(formAlert, 'Please provide your full name.', true);
        form.name.focus();
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        renderAlert(formAlert, 'Please provide a valid email address.', true);
        form.email.focus();
        return;
      }

      renderAlert(formAlert, 'Opening your email client…');

      const subjectParts = ['Practx waitlist request'];
      if (interest) {
        subjectParts.push(`- ${interest}`);
      }

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

      const details = [
        `Name: ${name}`,
        `Email: ${email}`,
        company ? `Practice / Company: ${company}` : null,
        `Primary interest: ${interest}`,
        '',
        '---',
        'Tracking:',
        `User hash: ${userHash}`,
        `Interaction hash: ${interactionHash}`
      ].filter(Boolean);

      const mailto = `mailto:rdennis125@gmail.com?subject=${encodeURIComponent(subjectParts.join(' '))}&body=${encodeURIComponent(details.join('\n'))}`;

      setTimeout(() => {
        window.location.href = mailto;
      }, 150);
    });
  }

  function initHelloWorldButton() {
    if (!helloButton || !helloAlert) return;

    helloButton.addEventListener('click', async () => {
      helloButton.disabled = true;
      renderAlert(helloAlert, 'Contacting the hello world API…');

      try {
        const entitlement = await getEntitlement();
        const headers = {
          'Content-Type': 'application/json'
        };

        if (entitlement) {
          headers['x-practx-entitlement'] = entitlement;
        }

        const response = await fetch(HELLO_WORLD_ROUTE, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            trigger: 'hero-button',
            subject: 'hello-world-demo'
          })
        });

        if (!response.ok) {
          const error = new Error(`Request failed with status ${response.status}`);
          error.status = response.status;
          throw error;
        }

        const data = await response.json().catch(() => ({ ok: true }));
        const successMessage = data?.message || 'Hello world API call succeeded!';
        renderAlert(helloAlert, successMessage, false);
      } catch (error) {
        console.error('Hello world API call failed', error);
        const message =
          error?.status === 401
            ? 'The Practx API rejected the request. Please refresh and try again.'
            : 'Unable to reach the hello world API. Please try again.';
        renderAlert(helloAlert, message, true);
      } finally {
        helloButton.disabled = false;
      }
    });
  }

  initSignupForm();
  initHelloWorldButton();
})();
