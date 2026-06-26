import { Dialog } from '@mui/material';
import { PopupTransition } from 'shared/components/@extended/Transitions';
import { adFields } from 'shared/components/ul-config/form-config';
import { FormikValues, useFormik } from 'formik';
import useHandleSite from 'shared/hooks/useHandleSites';
import useHandleSSID from 'shared/hooks/useHandleSSID';
import useValidationSchemas from 'shared/hooks/useValidation';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { RootState, useSelector } from 'shared/store';
import { DataCampaign, NewPartner, OptionList } from 'shared/types';
import { getOption } from 'shared/utils/handleData';
import GenericForm from '../GenericForm';

interface AdsDialogProps {
  open: boolean;
  onClose: () => void;
  record: DataCampaign | null;
  onSubmit: (values: NewPartner, resetForm: () => void) => Promise<void>;
  defaultSiteId?: string;
}

const getInitialValues = (ads: FormikValues | null) => {
  return {
    templateName: '',
    adType: '',
    timeStart: null,
    timeEnd: null,
    placement: '',
    SSID: '',
    siteId: ads?.site_id || ''
  };
};
const AdsDialog = ({ open, onClose, record, onSubmit, defaultSiteId }: AdsDialogProps) => {
  const intl = useIntl();
  const { fetchDataSites } = useHandleSite();
  const { fetchDataSSID } = useHandleSSID();

  const user = useSelector((state: RootState) => state.authSlice.user);
  const regionIdAccess = user?.regions?.map((item) => item.region_id);
  const [optionSite, setOptionSite] = useState<OptionList[]>([]);
  const [optionSSID, setOptionSSID] = useState<OptionList[]>([]);

  const { AdSchema } = useValidationSchemas();

  const initialValues = useMemo(() => getInitialValues({ ...record, site_id: defaultSiteId }), [record, defaultSiteId]);

  const formik = useFormik({
    initialValues,
    validationSchema: AdSchema,
    onSubmit: async (values: any, { resetForm }) => {
      onSubmit(values, resetForm);
    },
    enableReinitialize: true
  });
  const getOptionsSite = async (regionIdAccess: string) => {
    const dataSite = await fetchDataSites({ page: 1, pageSize: 20, regionDataInput: regionIdAccess });
    setOptionSite(getOption(dataSite, 'name', 'id'));
  };

  const getOptionsSSID = async (siteId: string) => {
    const siteList = [];
    siteList.push(String(siteId));
    const dataSSID = await fetchDataSSID({ page: 1, pageSize: 20, siteDataInput: JSON.stringify(siteList), siteId });

    const uniqueSSID = [...new Map(dataSSID.map((item: any) => [item.name, item])).values()];

    setOptionSSID(getOption(uniqueSSID, 'name', 'name'));
  };

  useEffect(() => {
    if (regionIdAccess) {
      getOptionsSite(JSON.stringify(regionIdAccess));
    }
  }, [JSON.stringify(regionIdAccess)]);

  useEffect(() => {
    if (formik.values.siteId) {
      getOptionsSSID(formik.values.siteId);
    }
  }, [formik.values.siteId]);

  const fieldsWithOptions = adFields.map((field) => {
    if (field.name === 'SSID') {
      return { ...field, options: optionSSID };
    }
    if (field.name === 'siteId') {
      return { ...field, options: optionSite };
    }
    return field;
  });

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      maxWidth="sm"
      TransitionComponent={PopupTransition}
      keepMounted
      fullWidth
      onClose={() => {
        onClose();
        formik.resetForm();
      }}
      open={open}
      sx={{ '& .MuiDialog-paper': { p: 0 }, transition: 'transform 225ms' }}
      aria-describedby="alert-dialog-slide-description"
    >
      <GenericForm
        title={intl.formatMessage({ id: 'add-ad' })}
        onCancel={handleClose}
        formik={formik}
        fields={fieldsWithOptions}
        isEditMode={false}
      />
    </Dialog>
  );
};

export default AdsDialog;
