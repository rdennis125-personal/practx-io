(function () {
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  };

  const trackEvent = (name, label) => {
    if (!name) return;
    const payload = { event: name, label };
    if (window.dataLayer && typeof window.dataLayer.push === 'function') {
      window.dataLayer.push(payload);
    }
    if (window.practxAnalytics && typeof window.practxAnalytics.track === 'function') {
      window.practxAnalytics.track(name, { label });
    }
  };

  class KitsValueCards {
    constructor(container) {
      this.container = container;
    }

    render() {
      if (!this.container) return;
      this.container.innerHTML = `
        <div class="kits-value-grid" role="list">
          <article class="kits-value-card" role="listitem">
            <h3>Retention that feels like care</h3>
            <p>Ship essentials on a cadence tied to each patient’s journey.</p>
          </article>
          <article class="kits-value-card" role="listitem">
            <h3>Your brand, their bathroom</h3>
            <p>Practice logo + Practx quality = daily brand impressions.</p>
          </article>
          <article class="kits-value-card" role="listitem">
            <h3>Click → pack → track</h3>
            <p>Outreach triggers fulfillment; dashboards show delivery + reactivation.</p>
          </article>
        </div>
      `;
    }
  }

  class KitsHowItWorks {
    constructor(container) {
      this.container = container;
    }

    render() {
      if (!this.container) return;
      const steps = [
        {
          step: 1,
          title: 'Choose triggers',
          copy: 'Target recalls, lapses, and benefit reminders in a single canvas.',
          label: 'choose_triggers'
        },
        {
          step: 2,
          title: 'Pick kit variants',
          copy: 'Match adult, child, and add-on kits to the audience segment.',
          label: 'pick_variant'
        },
        {
          step: 3,
          title: 'Auto-ship from outreach',
          copy: 'Let Practx orchestrate fulfillment the moment outreach fires.',
          label: 'auto_ship'
        },
        {
          step: 4,
          title: 'Track impact',
          copy: 'Monitor delivery, reactivation, and revenue in shared dashboards.',
          label: 'track_impact'
        }
      ];

      const headingId = 'kits-how-it-works-title';
      this.container.setAttribute('aria-labelledby', headingId);
      this.container.innerHTML = `
        <div class="how-it-works-header">
          <span class="eyebrow">How it works</span>
          <h3 id="${headingId}">How it works</h3>
          <p>Plug kits into your existing outreach automations in four steps.</p>
        </div>
        <ol class="how-it-works-steps">
          ${steps
            .map(
              (step) => `
                <li>
                  <button type="button" class="how-it-works-step" data-flow-step="${step.label}" aria-label="${step.step}. ${step.title}">
                    <span class="how-it-works-number">${step.step}</span>
                    <span class="how-it-works-copy">
                      <strong>${step.title}</strong>
                      <span>${step.copy}</span>
                    </span>
                  </button>
                </li>
              `
            )
            .join('')}
        </ol>
      `;

      this.container.querySelectorAll('[data-flow-step]').forEach((button) => {
        button.addEventListener('click', () => {
          const label = button.getAttribute('data-flow-step');
          trackEvent('po_kits_flow_step', label);
        });
      });
    }
  }

  const bindCtaTracking = () => {
    document.querySelectorAll('[data-analytics-event]').forEach((element) => {
      element.addEventListener('click', () => {
        const eventName = element.getAttribute('data-analytics-event');
        const label = element.getAttribute('data-analytics-label');
        trackEvent(eventName, label);
      });
    });
  };

  const observeKpis = () => {
    const kpis = document.querySelectorAll('[data-analytics-kpi]');
    if (!('IntersectionObserver' in window) || !kpis.length) {
      kpis.forEach((kpi) => {
        trackEvent('po_kpi_view', kpi.getAttribute('data-analytics-kpi'));
      });
      return;
    }

    const seen = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const label = entry.target.getAttribute('data-analytics-kpi');
          if (!seen.has(label)) {
            seen.add(label);
            trackEvent('po_kpi_view', label);
          }
        }
      });
    }, { threshold: 0.5 });

    kpis.forEach((kpi) => observer.observe(kpi));
  };

  ready(() => {
    document.querySelectorAll('[data-component="kits-value-cards"]').forEach((el) => {
      new KitsValueCards(el).render();
    });

    document.querySelectorAll('[data-component="kits-how-it-works"]').forEach((el) => {
      new KitsHowItWorks(el).render();
    });

    bindCtaTracking();
    observeKpis();
  });
})();
