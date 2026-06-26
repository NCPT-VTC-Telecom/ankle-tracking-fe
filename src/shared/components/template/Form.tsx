import { useEffect } from 'react';

//project-import
import GenericForm from 'shared/components/organisms/GenericForm';

//types
import { FieldConfig } from 'shared/types';

interface StepConfig {
  label: string;
  fields: FieldConfig[];
}

export interface Props {
  onCancel: () => void;
  title: string;
  isEditMode?: boolean;
  steps?: StepConfig[]; // Hỗ trợ stepper
  fieldConfig?: FieldConfig[]; // Hỗ trợ trường hợp không dùng stepper (như trước)
  formik: any;
  children?: React.ReactNode;
  onStepChange?: (step: number) => void;
}

const Form = ({ onCancel, formik, title, fieldConfig, isEditMode, children }: Props) => {
  // //eslint-disable-next-line
  // const calculateDataTotal = useCallback(
  //   debounce(() => {
  //     const dataUpload = Number(formik.values.dataUpload) || 0;
  //     const dataDownload = Number(formik.values.dataDownload) || 0;
  //     const dataTotal = dataUpload + dataDownload;

  //     if (formik.values.dataTotal !== dataTotal) {
  //       formik.setFieldValue('dataTotal', dataTotal);
  //     }
  //   }, 1500),
  //   [formik.values.dataUpload, formik.values.dataDownload, formik.values.dataTotal]
  // );

  useEffect(() => {
    formik.resetForm({ values: formik.initialValues });
    //eslint-disable-next-line
  }, [formik.initialValues]);

  return <GenericForm onCancel={onCancel} title={title} isEditMode={isEditMode} fields={fieldConfig} formik={formik} children={children} />;
};

export default Form;
