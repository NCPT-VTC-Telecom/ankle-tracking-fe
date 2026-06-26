import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Tooltip } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { DocumentUpload } from 'iconsax-react';

interface FileUploadButtonProps {
  acceptFileType?: string; // Loại file được chấp nhận (ví dụ: ".xlsx, .xls")
  dataHandler: (data: any[][]) => any[]; // Hàm để xử lý dữ liệu
  labelButton?: string;
  getDataExcel: (data: any[]) => void;
  className?: string;
}

//Example
// dataHandler={(jsonData) => {
//   return jsonData.slice(1).map(row => ({
//     fullname: row[0], // Chỉ số có thể thay đổi
//     email: row[1],
//     phone: row[2]
//   }));
// }}

function FileUploadButton({ acceptFileType, dataHandler, labelButton, getDataExcel, className }: FileUploadButtonProps) {
  const [fileInfo, setFileInfo] = useState<string>('');

  const intl = useIntl();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const fileSizeKB = (file.size / 1024).toFixed(2);

    setFileInfo(`${intl.formatMessage({ id: 'file' })}: ${file.name}, ${intl.formatMessage({ id: 'size' })}: ${fileSizeKB} KB`);
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const ab = e.target.result;
      const wb = XLSX.read(ab, { type: 'array' });
      const sheetName = wb.SheetNames[0];
      const worksheet = wb.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        blankrows: false
      }) as any[][];

      const processedData = dataHandler(jsonData);
      getDataExcel(processedData);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <div>
        <input
          accept={acceptFileType || '.xlsx, .xls'}
          style={{ display: 'none' }}
          id="raised-button-file"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="raised-button-file">
          <Tooltip className="cursor-pointer" title={<FormattedMessage id={labelButton || 'upload-file'} defaultMessage="Upload File" />}>
            <DocumentUpload size={28} style={{ color: 'gray', marginTop: 4 }} />
          </Tooltip>
        </label>
      </div>
      {fileInfo && <span style={{ marginTop: '10px' }}>{fileInfo}</span>}
    </>
  );
}

export default FileUploadButton;
