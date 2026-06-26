import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { DataCampaign } from 'shared/types';
import { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import LoadingButton from 'shared/components/@extended/LoadingButton';

interface ChangeCampaignStatusDialogProps {
  open: boolean;
  onClose: () => void;
  campaign?: DataCampaign | null;
  onChangeStatus: (status: number) => Promise<void>;
}

const statusOptions = [
  // { label: <FormattedMessage id="active" />, value: 1 },
  { label: <FormattedMessage id="inactive" />, value: 2 },
  { label: <FormattedMessage id="pending-approval" />, value: 9 }
];

const ChangeCampaignStatusDialog = ({ open, onClose, campaign, onChangeStatus }: ChangeCampaignStatusDialogProps) => {
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (campaign?.status_id) {
      setSelectedStatus(campaign.status_id);
    }
  }, [campaign]);

  const handleSubmit = async () => {
    if (!campaign || selectedStatus === campaign.status_id) return;

    setLoading(true);
    try {
      await onChangeStatus(selectedStatus!);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={600}>
          <FormattedMessage id="update-campaign-status" values={{ name: campaign?.name }} />
        </Typography>
      </DialogTitle>

      <DialogContent>
        <RadioGroup value={selectedStatus} onChange={(e) => setSelectedStatus(Number(e.target.value))}>
          {statusOptions.map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={<Radio />}
              disabled={campaign?.status_id === option.value}
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography>{option.label}</Typography>
                </Stack>
              }
            />
          ))}
        </RadioGroup>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          <FormattedMessage id="cancel" />
        </Button>
        <LoadingButton
          loading={loading}
          onClick={handleSubmit}
          disabled={loading || selectedStatus === null || selectedStatus === campaign?.status_id}
        >
          <FormattedMessage id="confirm" />
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ChangeCampaignStatusDialog;
