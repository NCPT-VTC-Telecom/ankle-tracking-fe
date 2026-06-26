import { ReactNode, useEffect, useState } from 'react';

// third-party
import { IntlProvider, MessageFormatElement } from 'react-intl';

// project-imports
import useConfig from 'shared/hooks/useConfig';
import { I18n } from 'shared/types/config';

// load locales files
const loadLocaleData = (locale: I18n) => {
  switch (locale) {
    case 'vi':
      return import('shared/utils/locales/vi.json');
    case 'en':
    default:
      return import('shared/utils/locales/en.json');
  }
};

// ==============================|| LOCALIZATION ||============================== //

interface Props {
  children: ReactNode;
}

const Locales = ({ children }: Props) => {
  const { i18n } = useConfig();

  const [messages, setMessages] = useState<Record<string, string> | Record<string, MessageFormatElement[]> | undefined>();

  useEffect(() => {
    loadLocaleData(i18n).then((d: { default: Record<string, string> | Record<string, MessageFormatElement[]> | undefined }) => {
      setMessages(d.default);
    });
  }, [i18n]);

  return (
    <>
      {messages && (
        <IntlProvider locale={i18n} defaultLocale="en" messages={messages}>
          {children}
        </IntlProvider>
      )}
    </>
  );
};

export default Locales;
