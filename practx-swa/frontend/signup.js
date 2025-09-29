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

    showAlert('Submitting…');

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, company, interest }),
      });

      const data = await response.json().catch(() => ({ ok: false, error: 'Invalid response' }));

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Unable to submit. Please try again.');
      }

      showAlert('Success! Redirecting…');
      setTimeout(() => {
        window.location.href = '/thank-you.html';
      }, 1200);
    } catch (err) {
      console.error('Signup error', err);
      showAlert(err.message || 'Something went wrong. Please retry.', true);
    }
  });
})();
