(function () {
  const storageKey = 'practx:lastEntitySubmission';

  const summaryBuilders = {
    identity(form, formData) {
      const name = getTextValue(formData, 'user-name') || 'New identity';
      const role = getSelectLabel(form, 'user-role') || 'role pending';
      const organization = getSelectLabel(form, 'user-org') || 'no organization selected';
      const status = getSelectLabel(form, 'user-status') || 'status pending';
      const startDate = formatDateValue(formData.get('user-start')) || 'Start date TBD';
      const controls = getCheckedLabels(form, 'user-');
      const email = getTextValue(formData, 'user-email') || 'No email provided';

      return {
        heading: `${name} staged for access`,
        body: `${name} will onboard as ${role.toLowerCase()} for ${organization}.`,
        details: [
          `Status: ${status}`,
          `Start date: ${startDate}`,
          controls.length
            ? `Security controls: ${controls.join(', ')}`
            : 'Security controls: Standard enrollment',
          `Work email: ${email}`,
        ],
      };
    },
    organization(form, formData) {
      const name = getTextValue(formData, 'org-name') || 'New organization';
      const type = getSelectLabel(form, 'org-type') || 'Type pending';
      const region = getSelectLabel(form, 'org-region') || 'Region pending';
      const stage = getSelectLabel(form, 'org-stage') || 'Stage pending';
      const systems = getTextValue(formData, 'org-systems') || 'No connected systems listed';
      const checklist = getCheckedLabels(form, 'org-');

      return {
        heading: `${name} onboarding captured`,
        body: `${name} (${type}) is tracking toward ${stage.toLowerCase()} in the ${region.toLowerCase()} region.`,
        details: [
          `Connected systems: ${systems}`,
          checklist.length
            ? `Compliance complete: ${checklist.join(', ')}`
            : 'Compliance complete: Pending acknowledgements',
        ],
      };
    },
    equipment(form, formData) {
      const assetId = getTextValue(formData, 'equip-id') || 'New asset';
      const type = getTextValue(formData, 'equip-type') || 'Type pending';
      const location = getTextValue(formData, 'equip-location') || 'Location pending';
      const manufacturer = getTextValue(formData, 'equip-manufacturer') || 'Manufacturer unknown';
      const model = getTextValue(formData, 'equip-model') || 'Model pending';
      const installed = formatDateValue(formData.get('equip-installed')) || 'Installation date TBD';
      const status = getSelectLabel(form, 'equip-status') || 'Status pending';
      const service = formatDateValue(formData.get('equip-service')) || 'Service window TBD';
      const monitoring = getCheckedLabels(form, 'equip-');

      return {
        heading: `${assetId} registered`,
        body: `${assetId} (${type}) is staged at ${location} with status ${status.toLowerCase()}.`,
        details: [
          `Manufacturer: ${manufacturer}`,
          `Model: ${model}`,
          `Installed: ${installed}`,
          `Next service: ${service}`,
          monitoring.length
            ? `Monitoring: ${monitoring.join(', ')}`
            : 'Monitoring: Standard telemetry',
        ],
      };
    },
    appointment(form, formData) {
      const patient = getTextValue(formData, 'appt-patient') || 'Patient pending';
      const practice = getSelectLabel(form, 'appt-practice') || 'Practice pending';
      const provider = getSelectLabel(form, 'appt-provider') || 'Provider pending';
      const scheduled = formatDateValue(formData.get('appt-datetime')) || 'Time to be scheduled';
      const reason = getTextValue(formData, 'appt-reason') || 'No visit reason supplied';
      const outreach = getCheckedLabels(form, 'appt-');

      return {
        heading: `${patient} visit scheduled`,
        body: `${patient} is booked with ${provider.toLowerCase()} at ${practice.toLowerCase()} on ${scheduled}.`,
        details: [
          `Visit reason: ${reason}`,
          outreach.length
            ? `Outreach steps: ${outreach.join(', ')}`
            : 'Outreach steps: Standard reminders',
        ],
      };
    },
    service(form, formData) {
      const workOrder = getTextValue(formData, 'wo-id') || 'New work order';
      const practice = getTextValue(formData, 'wo-practice') || 'Practice pending';
      const asset = getTextValue(formData, 'wo-asset') || 'Asset pending';
      const sla = getSelectLabel(form, 'wo-sla') || 'SLA pending';
      const status = getSelectLabel(form, 'wo-status') || 'Status queued';
      const dispatch = getSelectLabel(form, 'wo-dispatch') || 'Dispatch plan pending';
      const priority = getSelectLabel(form, 'wo-priority') || 'Priority pending';

      return {
        heading: `${workOrder} staged for dispatch`,
        body: `${workOrder} logged for ${practice} on ${asset}.`,
        details: [
          `SLA: ${sla}`,
          `Status: ${status}`,
          `Dispatch: ${dispatch}`,
          `Priority: ${priority}`,
        ],
      };
    },
  };

  function getTextValue(formData, name) {
    const raw = formData.get(name);
    return typeof raw === 'string' ? raw.trim() : '';
  }

  function getSelectLabel(form, name) {
    const field = form.querySelector(`[name="${name}"]`);
    if (field && field instanceof HTMLSelectElement) {
      const option = field.selectedOptions[0];
      if (option && option.value) {
        return option.textContent.trim();
      }
    }
    return '';
  }

  function getCheckedLabels(form, prefix) {
    const inputs = Array.from(
      form.querySelectorAll(`input[type="checkbox"][name^="${prefix}"]`)
    );
    return inputs
      .filter((input) => input.checked)
      .map((input) => {
        const label = input.closest('label');
        if (label) {
          return label.textContent.replace(/\s+/g, ' ').trim();
        }
        return input.name;
      });
  }

  function formatDateValue(raw) {
    if (!raw) {
      return '';
    }
    const value = typeof raw === 'string' ? raw.trim() : '';
    if (!value) {
      return '';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    if (value.includes('T')) {
      return date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    }
    return date.toLocaleDateString(undefined, {
      dateStyle: 'medium',
    });
  }

  function storeSubmission(payload) {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(payload));
    } catch (err) {
      console.warn('Unable to persist mock entity submission', err);
    }
  }

  function readSubmission() {
    try {
      const raw = sessionStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn('Unable to read mock entity submission', err);
      return null;
    }
  }

  function clearSubmission() {
    try {
      sessionStorage.removeItem(storageKey);
    } catch (err) {
      console.warn('Unable to clear mock entity submission', err);
    }
  }

  function renderBanner(payload) {
    if (!payload || payload.destination !== window.location.pathname) {
      return;
    }

    const main = document.querySelector('main');
    if (!main) {
      clearSubmission();
      return;
    }

    const summary = payload.summary || {};

    const banner = document.createElement('section');
    banner.className = 'card mock-intake-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('tabindex', '-1');

    const eyebrow = document.createElement('span');
    eyebrow.className = 'mock-intake-banner__eyebrow';
    eyebrow.textContent = 'Mock submission received';
    banner.appendChild(eyebrow);

    if (summary.heading) {
      const heading = document.createElement('h2');
      heading.textContent = summary.heading;
      banner.appendChild(heading);
    }

    if (summary.body) {
      const body = document.createElement('p');
      body.textContent = summary.body;
      banner.appendChild(body);
    }

    if (Array.isArray(summary.details) && summary.details.length) {
      const list = document.createElement('ul');
      list.className = 'mock-intake-banner__details';
      summary.details.forEach((detail) => {
        const item = document.createElement('li');
        item.textContent = detail;
        list.appendChild(item);
      });
      banner.appendChild(list);
    }

    const meta = document.createElement('p');
    meta.className = 'mock-intake-banner__meta';
    const timestamp = new Date(payload.timestamp);
    const timestampValid = !Number.isNaN(timestamp.getTime());
    meta.textContent = timestampValid
      ? `Captured ${timestamp.toLocaleString(undefined, {
          dateStyle: 'medium',
          timeStyle: 'short',
        })} in the Admin Command Center.`
      : 'Captured moments ago in the Admin Command Center.';
    banner.appendChild(meta);

    main.prepend(banner);

    try {
      window.dispatchEvent(new CustomEvent('entity-submission', { detail: payload }));
    } catch (err) {
      console.warn('Unable to dispatch entity submission event', err);
    }

    clearSubmission();

    try {
      banner.focus({ preventScroll: true });
    } catch (err) {
      // focus is best-effort
    }
  }

  function handleFormSubmission(event) {
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) {
      return;
    }

    const { entityType, destination } = form.dataset;
    if (!destination) {
      return;
    }

    event.preventDefault();

    const formData = new FormData(form);
    const summaryBuilder = entityType ? summaryBuilders[entityType] : null;
    const summary = summaryBuilder ? summaryBuilder(form, formData) : null;
    const fields = {};

    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed) {
          fields[key] = trimmed;
        }
      }
    });

    storeSubmission({
      destination,
      entityType: entityType || 'unknown',
      timestamp: Date.now(),
      summary,
      fields,
    });

    window.location.assign(destination);
  }

  function initForms() {
    const forms = document.querySelectorAll('.entity-form[data-destination]');
    forms.forEach((form) => {
      form.addEventListener('submit', handleFormSubmission);
    });
  }

  function initBanner() {
    const payload = readSubmission();
    if (payload) {
      renderBanner(payload);
    }
  }

  function init() {
    initForms();
    initBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
