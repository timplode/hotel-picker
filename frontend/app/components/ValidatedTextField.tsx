import { TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)<{ isValid?: boolean }>(({ theme, isValid }) => ({
  '& .MuiOutlinedInput-root': {
    ...(isValid && {
      '& fieldset': {
        borderColor: theme.palette.success.main,
        borderWidth: 2,
      },
      '&:hover fieldset': {
        borderColor: theme.palette.success.main,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.success.main,
      },
    }),
  },
}));

interface ValidatedTextFieldProps extends Omit<TextFieldProps, 'value'> {
  value: string | null;
  validator?: (value: string) => boolean;
}

export default function ValidatedTextField({ 
  value, 
  validator, 
  ...textFieldProps 
}: ValidatedTextFieldProps) {
  const isValid = validator && value ? validator(value) : false;

  return (
    <StyledTextField
      {...textFieldProps}
      value={value}
      isValid={isValid}
    />
  );
}