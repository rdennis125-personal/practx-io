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

    showAlert('Opening your email client…');

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
})();

(function () {
  const button = document.getElementById('hello-button');
  const alertBox = document.getElementById('hello-alert');
  if (!button || !alertBox) return;

  function showMessage(message, isError) {
    alertBox.textContent = message;
    alertBox.classList.toggle('error', Boolean(isError));
    alertBox.classList.add('show');
  }

  async function callHelloWorld() {
    button.disabled = true;
    showMessage('Contacting the hello world API…');

    try {
      const response = await fetch('/api/hello-world', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ trigger: 'hero-button' })
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json().catch(() => ({ ok: true }));
      const successMessage = data?.message || 'Hello world API call succeeded!';
      showMessage(successMessage, false);
    } catch (error) {
      console.error('Hello world API call failed', error);
      showMessage('Unable to reach the hello world API. Please try again.', true);
    } finally {
      button.disabled = false;
    }
  }

  button.addEventListener('click', callHelloWorld);
})();
