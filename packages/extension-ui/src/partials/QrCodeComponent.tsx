import React from 'react';
import QRCode from 'qrcode.react';

interface QRCodeProps {
  value: string;
  size?: number;
}

const QRCodeComponent: React.FC<QRCodeProps> = ({ value, size = 256 }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <QRCode value={value} size={size} />
    </div>
  );
};

export default QRCodeComponent;
