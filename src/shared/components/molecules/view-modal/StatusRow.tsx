import {
  //  Typography,
  Stack
} from '@mui/material';
import ChipStatus from 'shared/components/atoms/ChipStatus';
import { useState } from 'react';
import { AttributesPropsChipView } from 'shared/types';

function StatusView({
  name,
  id,
  successLabel,
  errorLabel,
  warningLabel,
  infoLabel,
  dangerLabel,
  isolatedLabel,
  isPassword,
  value // Thêm prop value để hiển thị giá trị nếu là password
}: AttributesPropsChipView & { value?: string }) {
  // Mở rộng type để thêm value
  // State để theo dõi trạng thái hiển thị khi là password
  const [isRevealed, setIsRevealed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Xử lý khi hover
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Xử lý khi click
  const handleClick = () => {
    setIsRevealed((prev) => !prev);
  };

  // Hiển thị giá trị dựa trên trạng thái nếu là password
  const displayValue = isPassword && value ? (isRevealed || isHovered ? value : '***********') : null;

  return (
    <Stack spacing={0.5}>
      {/* <Typography color="secondary">{name}</Typography> */}
      <div>
        {isPassword && value ? (
          <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleClick} style={{ cursor: 'pointer' }}>
            {displayValue}
          </div>
        ) : (
          <ChipStatus
            id={id}
            successLabel={successLabel}
            infoLabel={infoLabel}
            errorLabel={errorLabel}
            warningLabel={warningLabel}
            dangerLabel={dangerLabel}
            isolatedLabel={isolatedLabel}
          />
        )}
      </div>
    </Stack>
  );
}

export default StatusView;
