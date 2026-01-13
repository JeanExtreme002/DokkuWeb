import { CubeIcon, GlobeIcon, PlusIcon } from '@radix-ui/react-icons';
import { Avatar, Box, Button, Flex, Heading, Text } from '@radix-ui/themes';

import { usePageTranslation } from '@/i18n/utils';

import styles from '../../home.module.css';

interface WelcomeSectionProps {
  userName: string;
  userImage?: string;
  onCreateApp: () => void;
  onCreateService: () => void;
  onCreateNetwork: () => void;
}

export function WelcomeSection(props: WelcomeSectionProps) {
  const { userName, userImage, onCreateApp, onCreateService, onCreateNetwork } = props;
  const { t } = usePageTranslation();

  return (
    <Box className={styles.welcomeSection}>
      <Flex align='center' justify='between' className={styles.welcomeHeader}>
        <Flex align='center' gap='4'>
          <Avatar
            size='6'
            src={userImage || undefined}
            fallback={userName.charAt(0).toUpperCase()}
            radius='full'
            className={styles.userAvatar}
          />
          <Box>
            <Heading size='8' weight='bold' className={styles.welcomeTitle}>
              {t('welcome.title', { name: userName.split(' ')[0] })}
            </Heading>
            <Text size='4' className={styles.welcomeSubtitle}>
              {t('welcome.subtitle')}
            </Text>
          </Box>
        </Flex>

        <Flex gap='2' className={styles.quickActionsInline}>
          <Button size='3' className={styles.quickActionButtonGreen} onClick={onCreateApp}>
            <PlusIcon />
            {t('welcome.actions.newApp')}
          </Button>
          <Button
            size='3'
            variant='soft'
            className={styles.quickActionButton}
            onClick={onCreateService}
          >
            <CubeIcon />
            {t('welcome.actions.newService')}
          </Button>
          <Button
            size='3'
            variant='soft'
            className={styles.quickActionButton}
            onClick={onCreateNetwork}
          >
            <GlobeIcon />
            {t('welcome.actions.createNetwork')}
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}
