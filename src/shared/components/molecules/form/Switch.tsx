import { FormControlLabel, Grid, Stack, InputLabel, FormHelperText, Switch } from '@mui/material';
import { FormattedMessage } from 'react-intl';
//types
import { AttributesPropSwitch } from 'shared/types';

const SwitchField: React.FC<AttributesPropSwitch> = ({
  name,
  field,
  formik,
  xs,
  xsCheckBox,
  mdCheckBox,
  md,
  inputLabel,
  required,
  labelTrue,
  labelFalse,
  disabled,
  note
}) => {
  const { errors, touched, setFieldValue, values } = formik;

  return (
    <Grid item xs={xs || 12} md={md || 12}>
      <Stack spacing={1.25}>
        <InputLabel htmlFor={name}>
          {inputLabel}
          {required ? <span className="text-red-500 text-[16px]"> *</span> : ''}
        </InputLabel>
        <Grid container spacing={1.25}>
          <Grid item xs={xsCheckBox || 6} md={mdCheckBox || 4}>
            <div className={note && 'flex flex-row items-center'}>
              <FormControlLabel
                control={
                  <Switch
                    checked={values[field] === 'true' ? true : false}
                    disabled={disabled}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      setFieldValue(field, newValue.toString());
                    }}
                    name={field}
                  />
                }
                label={values[field] === 'true' ? labelTrue || <FormattedMessage id="on" /> : labelFalse || <FormattedMessage id="off" />}
              />
              {note}
            </div>
          </Grid>
        </Grid>
        {touched[field] && errors[field] && (
          <FormHelperText error id="switch-helper-text" sx={{ pl: 1.75 }}>
            {errors[field]}
          </FormHelperText>
        )}
      </Stack>
    </Grid>
  );
};

export default SwitchField;
