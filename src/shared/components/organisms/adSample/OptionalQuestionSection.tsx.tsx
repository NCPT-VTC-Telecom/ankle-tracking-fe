import { IconButton, MenuItem } from '@mui/material';
import { Box, Grid, InputAdornment, Stack, Typography } from '@mui/material';
import { Button } from '@mui/material';
import { TextField } from '@mui/material';
import { FieldArray } from 'formik';
import { Add, Text, Trash } from 'iconsax-react';

const OptionalQuestionSection = ({ intl, formik, questionName, typeAnswerName, answerArrayName }: any) => (
  <>
    <Grid item xs={12}>
      <TextField
        fullWidth
        name={questionName}
        value={formik.values[questionName]}
        onChange={formik.handleChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ color: 'primary.main' }}>
                  <Text size="18" />
                </Box>
                <Typography variant="body2" fontWeight="500" color="text.secondary">
                  {intl.formatMessage({ id: 'optional-question' })}:
                </Typography>
              </Stack>
            </InputAdornment>
          )
        }}
      />
    </Grid>

    <Grid item xs={12}>
      <TextField
        fullWidth
        select
        value={formik.values[typeAnswerName]}
        onChange={(e) => formik.setFieldValue(typeAnswerName, e.target.value)}
        inputProps={{ name: typeAnswerName, id: typeAnswerName }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="end">
              <Typography variant="body2" color="text.secondary">
                {intl.formatMessage({ id: 'type-optional-answer' })}
              </Typography>
            </InputAdornment>
          )
        }}
      >
        <MenuItem value="input">Input</MenuItem>
        <MenuItem value="select">Select</MenuItem>
        <MenuItem value="select-multiple">Select Multiple</MenuItem>
      </TextField>
    </Grid>

    {(formik.values[typeAnswerName] === 'select' || formik.values[typeAnswerName] === 'select-multiple') && (
      <Grid item xs={12}>
        <FieldArray name={answerArrayName}>
          {({ push, remove }) => (
            <Box display="flex" flexDirection="column" gap={1} mb={2}>
              {formik.values[answerArrayName].map((answer: string, index: number) => (
                <Box key={index} display="flex" alignItems="center" gap={1}>
                  <TextField
                    fullWidth
                    name={`${answerArrayName}.${index}`}
                    value={answer}
                    onChange={formik.handleChange}
                    placeholder={`${intl.formatMessage({ id: 'answer' })} ${index + 1}`}
                  />
                  <IconButton color="error" onClick={() => remove(index)} disabled={formik.values[answerArrayName].length === 1}>
                    <Trash />
                  </IconButton>
                </Box>
              ))}
              <Button variant="outlined" size="small" onClick={() => push('')} startIcon={<Add />}>
                {intl.formatMessage({ id: 'add-answer' })}
              </Button>
            </Box>
          )}
        </FieldArray>
      </Grid>
    )}
  </>
);

export default OptionalQuestionSection;
