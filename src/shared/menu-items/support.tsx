// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { DocumentCode2, I24Support, Driving } from 'iconsax-react';

// type
import { NavItemType } from 'shared/types/menu';

// icons
const icons = {
  samplePage: DocumentCode2,
  documentation: I24Support,
  roadmap: Driving
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const support: NavItemType = {
  id: 'other',
  title: <FormattedMessage id="others" />,
  type: 'group',
  children: [
    {
      id: 'sample-page',
      title: <FormattedMessage id="sample-page" />,
      type: 'item',
      url: '/sample-page',
      icon: icons.samplePage
    },
    {
      id: 'documentation',
      title: <FormattedMessage id="documentation" />,
      type: 'item',
      url: 'https://phoenixcoded.gitbook.io/able-pro/v/react/',
      icon: icons.documentation,
      external: true,
      target: true,
      chip: {
        label: 'gitbook',
        color: 'info',
        size: 'small'
      }
    },
    {
      id: 'roadmap',
      title: <FormattedMessage id="roadmap" />,
      type: 'item',
      url: 'https://phoenixcoded.gitbook.io/able-pro/v/react/roadmap',
      icon: icons.roadmap,
      external: true,
      target: true
    }
  ]
};

export default support;
