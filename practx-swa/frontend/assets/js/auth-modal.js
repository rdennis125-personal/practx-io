(function () {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea',
    'input:not([type="hidden"])',
    'select',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  function createModal() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="auth-modal" id="auth-modal" aria-hidden="true">
        <div class="auth-modal__overlay" data-close></div>
        <div class="auth-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
          <button type="button" class="auth-modal__close" data-close aria-label="Close login or sign-up form">
            <span aria-hidden="true">&times;</span>
          </button>
          <header class="auth-modal__header">
            <h2 id="auth-modal-title">Login / Sign-Up</h2>
            <p>Access your Practx command centers or create a new profile to get started.</p>
          </header>
          <form id="auth-form" class="auth-form">
            <label for="auth-name">Full name</label>
            <input id="auth-name" name="name" type="text" autocomplete="name" required />

            <label for="auth-email">Work email</label>
            <input id="auth-email" name="email" type="email" autocomplete="email" required />

            <label for="auth-role">Role</label>
            <input
              id="auth-role"
              name="role"
              type="text"
              autocomplete="organization-title"
              placeholder="Practice manager, technician, etc."
              required
            />

            <label for="auth-area">Primary command center</label>
            <select id="auth-area" name="area" required>
              <option value="" disabled selected>Select an option</option>
              <option value="practice">Practice Command Center</option>
              <option value="equipment">Equipment Command Center</option>
              <option value="patient">Patient Outreach Command Center</option>
              <option value="service">Service Command Center</option>
              <option value="smile-spa">Smile Spa Command Center</option>
            </select>

            <button type="submit" class="button auth-form__submit">Continue</button>
          </form>
        </div>
      </div>
    `;
    return wrapper.firstElementChild;
  }

  function trapFocus(event, modal) {
    if (!modal.classList.contains('is-open')) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal(modal);
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusable = Array.from(modal.querySelectorAll(focusableSelectors)).filter(
      (el) => !el.hasAttribute('disabled') && el.getAttribute('tabindex') !== '-1'
    );

    if (!focusable.length) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openModal(modal, previouslyFocused) {
    if (!modal) {
      return;
    }

    if (previouslyFocused) {
      let focusId = previouslyFocused.dataset.focusId;
      if (!focusId) {
        focusId = `focus-${Date.now()}`;
        previouslyFocused.dataset.focusId = focusId;
      }
      modal.dataset.previousFocus = focusId;
    } else {
      delete modal.dataset.previousFocus;
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    const firstInput = modal.querySelector('#auth-name');
    if (firstInput) {
      firstInput.focus();
    }
  }

  function closeModal(modal) {
    if (!modal) {
      return;
    }

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    const focusId = modal.dataset.previousFocus;
    if (focusId) {
      const original = document.querySelector(`[data-focus-id="${focusId}"]`);
      if (original) {
        original.focus();
      }
    }
    delete modal.dataset.previousFocus;
  }

  document.addEventListener('DOMContentLoaded', function () {
    const loginButtons = Array.from(document.querySelectorAll('.nav-auth-button')).filter(
      (element) => element.tagName === 'BUTTON'
    );

    if (!loginButtons.length) {
      return;
    }

    const existingModal = document.getElementById('auth-modal');
    const modal = existingModal || createModal();

    if (!existingModal) {
      document.body.appendChild(modal);
    }

    const overlay = modal.querySelector('[data-close]');
    const form = modal.querySelector('#auth-form');

    function handleOpen(event) {
      event.preventDefault();
      const previouslyFocused = document.activeElement;
      openModal(modal, previouslyFocused);
    }

    loginButtons.forEach((button) => {
      button.addEventListener('click', handleOpen);
    });

    if (overlay) {
      overlay.addEventListener('click', function () {
        closeModal(modal);
      });
    }

    modal.querySelectorAll('[data-close]').forEach((closeButton) => {
      closeButton.addEventListener('click', function () {
        closeModal(modal);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (modal.classList.contains('is-open')) {
        trapFocus(event, modal);
      }
    });

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        window.location.href = '/welcome.html';
      });
    }
  });
})();
