(function () {
  if (window.practxSwaSignupConfig) {
    return;
  }

  window.practxSwaSignupConfig = {
    userFlow: 'SWA',
    redirectPath: '/welcome',
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
