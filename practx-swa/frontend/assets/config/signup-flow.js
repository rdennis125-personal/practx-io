(function () {
  if (window.practxSwaSignupConfig) {
    return;
  }

  window.practxSwaSignupConfig = {
    userFlow: 'SWA',
    redirectPath: '/welcome.html',
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
})();
