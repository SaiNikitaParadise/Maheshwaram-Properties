/* ============================================================
   Cookie Consent Banner — AdSense & Analytics disclosure
   Lightweight, no dependencies, GDPR/Google policy compliant
   ============================================================ */
(function () {
  var COOKIE_KEY = 'mp_cookie_consent';
  if (localStorage.getItem(COOKIE_KEY)) return;

  var banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML =
    '<div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">' +
      '<p style="margin:0;flex:1;min-width:200px;">We use cookies and Google AdSense to personalise content and ads, and to analyse our traffic. By continuing to use this site, you accept our ' +
        '<a href="/privacy-policy.html" style="color:#c9a227;text-decoration:underline;">Privacy Policy</a> and ' +
        '<a href="/terms-of-use.html" style="color:#c9a227;text-decoration:underline;">Terms of Use</a>.' +
      '</p>' +
      '<button id="cookie-accept" style="background:#c9a227;color:#fff;border:none;padding:10px 22px;border-radius:6px;cursor:pointer;font-weight:600;white-space:nowrap;flex-shrink:0;">Accept &amp; Continue</button>' +
    '</div>';

  Object.assign(banner.style, {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    background: '#1a2340',
    color: '#e8e4da',
    padding: '14px 24px',
    zIndex: '99999',
    fontSize: '0.9rem',
    lineHeight: '1.5',
    boxShadow: '0 -2px 16px rgba(0,0,0,0.25)',
  });

  document.body.appendChild(banner);

  document.getElementById('cookie-accept').addEventListener('click', function () {
    localStorage.setItem(COOKIE_KEY, '1');
    banner.style.display = 'none';
  });
})();
