(function () {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea',
    'input:not([type="hidden"])',
    'select',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  const ROLE_GROUPS = [
    {
      area: 'practice',
      label: 'Practice Management',
      roles: [
        { value: 'practice-manager', label: 'Practice Manager' },
        { value: 'regional-operations-director', label: 'Regional Operations Director' },
        { value: 'clinical-coordinator', label: 'Clinical Coordinator' }
      ]
    },
    {
      area: 'equipment',
      label: 'Equipment Management',
      roles: [
        { value: 'equipment-coordinator', label: 'Equipment Coordinator' },
        { value: 'procurement-specialist', label: 'Procurement Specialist' },
        { value: 'biomedical-engineer', label: 'Biomedical Engineer' }
      ]
    },
    {
      area: 'patient',
      label: 'Patient Outreach',
      roles: [
        { value: 'patient-outreach-specialist', label: 'Patient Outreach Specialist' },
        { value: 'marketing-manager', label: 'Marketing Manager' },
        { value: 'community-liaison', label: 'Community Liaison' }
      ]
    },
    {
      area: 'service',
      label: 'Service Operations',
      roles: [
        { value: 'service-manager', label: 'Service Manager' },
        { value: 'field-technician-lead', label: 'Field Technician Lead' },
        { value: 'dispatch-coordinator', label: 'Dispatch Coordinator' }
      ]
    },
    {
      area: 'smile-spa',
      label: 'Smile Spa',
      roles: [
        { value: 'smile-spa-lead', label: 'Smile Spa Lead' },
        { value: 'studio-manager', label: 'Studio Manager' },
        { value: 'guest-experience-director', label: 'Guest Experience Director' }
      ]
    }
  ];

  function populateRoleSelect(select) {
    if (!select || select.dataset.populated === 'true') {
      return;
    }

    const fragment = document.createDocumentFragment();
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select your role';
    placeholder.disabled = true;
    placeholder.selected = true;
    fragment.appendChild(placeholder);

    ROLE_GROUPS.forEach((group) => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = group.label;
      group.roles.forEach((role) => {
        const option = document.createElement('option');
        option.value = role.value;
        option.textContent = role.label;
        option.dataset.area = group.area;
        optgroup.appendChild(option);
      });
      fragment.appendChild(optgroup);
    });

    select.textContent = '';
    select.appendChild(fragment);
    select.dataset.populated = 'true';
  }

  function filterRoleOptions(select, area) {
    if (!select) {
      return;
    }

    let hasVisibleSelection = false;

    Array.from(select.options).forEach((option) => {
      if (!option.dataset.area) {
        return;
      }

      const matches = !area || option.dataset.area === area;
      option.hidden = !matches;
      option.disabled = !matches;

      if (matches && option.selected) {
        hasVisibleSelection = true;
      }
    });

    if (!hasVisibleSelection) {
      select.value = '';
      const placeholderOption = select.querySelector('option[value=""]');
      if (placeholderOption) {
        placeholderOption.selected = true;
      }
    }
  }

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
            <select id="auth-role" name="role" autocomplete="organization-title" required>
              <option value="" disabled selected>Select your role</option>
            </select>

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
    const roleSelect = modal.querySelector('#auth-role');
    const areaSelect = modal.querySelector('#auth-area');

    populateRoleSelect(roleSelect);
    filterRoleOptions(roleSelect, areaSelect ? areaSelect.value : '');

    function handleOpen(event) {
      event.preventDefault();
      const previouslyFocused = document.activeElement;

      if (form) {
        form.reset();
      }

      if (roleSelect) {
        roleSelect.value = '';
        const placeholderOption = roleSelect.querySelector('option[value=""]');
        if (placeholderOption) {
          placeholderOption.selected = true;
        }
      }

      if (areaSelect) {
        areaSelect.value = '';
      }

      filterRoleOptions(roleSelect, areaSelect ? areaSelect.value : '');
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

    if (areaSelect && roleSelect) {
      areaSelect.addEventListener('change', function () {
        if (!areaSelect.value) {
          roleSelect.value = '';
          const placeholderOption = roleSelect.querySelector('option[value=""]');
          if (placeholderOption) {
            placeholderOption.selected = true;
          }
        }
        filterRoleOptions(roleSelect, areaSelect.value);
      });

      roleSelect.addEventListener('change', function () {
        const selectedOption = roleSelect.selectedOptions[0];
        if (!selectedOption || !selectedOption.dataset.area) {
          return;
        }

        if (areaSelect.value !== selectedOption.dataset.area) {
          areaSelect.value = selectedOption.dataset.area;
        }

        filterRoleOptions(roleSelect, areaSelect.value);
      });
    }

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
