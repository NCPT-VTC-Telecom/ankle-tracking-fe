import { useIntl } from 'react-intl';

function useMapCode() {
  const intl = useIntl();

  function getStatusMessage(category: string, code: number) {
    switch (category) {
      case 'general':
        return generalStatus(code);
      case 'login':
        return loginStatus(code);
      case 'registration':
        return registrationStatus(code);
      case 'activeStatus':
        return activeStatus(code);
      case 'onlineStatus':
        return onlineStatus(code);
      case 'transactionStatus':
        return transactionStatus(code);
      default:
        return 'Invalid category';
    }
  }

  function generalStatus(code: number) {
    switch (code) {
      case 0:
        return intl.formatMessage({ id: 'success' });
      case -1:
        return intl.formatMessage({ id: 'fail' });
      case -2:
        return intl.formatMessage({ id: 'request-invalid' });
      case -3:
        return intl.formatMessage({ id: 'no-permission' });
      case -4:
        return intl.formatMessage({ id: 'no-information-found' });
      case -5:
        return intl.formatMessage({ id: 'server-error' });
      default:
        return intl.formatMessage({ id: 'unknown-status' });
    }
  }

  function loginStatus(code: number) {
    switch (code) {
      case 0:
        return intl.formatMessage({ id: 'login-successfully' });
      case -1:
        return intl.formatMessage({ id: 'username-incorrect-not-exits' });
      case -2:
        return intl.formatMessage({ id: 'request-invalid' });
      case -3:
        return intl.formatMessage({ id: 'password-incorrect' });
      case -4:
      case -5:
        return intl.formatMessage({ id: 'server-error' });
      default:
        return intl.formatMessage({ id: 'unknown-status' });
    }
  }

  function registrationStatus(code: number) {
    switch (code) {
      case 0:
        return intl.formatMessage({ id: 'register-successfully' });
      case -1:
        return intl.formatMessage({ id: 'user-exits' });
      case -2:
        return intl.formatMessage({ id: 'email-username-invalid' });
      case -3:
        return intl.formatMessage({ id: 'password-incorrect' });
      case -4:
        return intl.formatMessage({ id: 'role-not-exits' });
      case -5:
        return intl.formatMessage({ id: 'email-username-exits' });
      case -6:
        return intl.formatMessage({ id: 'server-error' });
      default:
        return intl.formatMessage({ id: 'unknown-status' });
    }
  }

  function transactionStatus(code: number) {
    switch (code) {
      case 30:
        return intl.formatMessage({ id: 'not-paid' });
      case 31:
        return intl.formatMessage({ id: 'pending' });
      case 32:
        return intl.formatMessage({ id: 'paid' });
    }
  }

  function activeStatus(code: number) {
    if (code === 14) {
      return intl.formatMessage({ id: 'active' });
    } else {
      return intl.formatMessage({ id: 'inactive' });
    }
  }

  function onlineStatus(code: number) {
    if (code === 14) {
      return intl.formatMessage({ id: 'online' });
    } else {
      return intl.formatMessage({ id: 'offline' });
    }
  }

  return { getStatusMessage };
}

export default useMapCode;
