import QRCode from 'qrcode.react';
import React from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
}

const QRCodeComponent: React.FC<QRCodeProps> = ({ size = 256, value }) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <QRCode
        value={value}
        size={size} />
    </div>
  );
};

export default QRCodeComponent;
