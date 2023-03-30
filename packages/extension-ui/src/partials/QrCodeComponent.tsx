import React from 'react';
import QRCode from 'qrcode.react';

interface QRCodeProps {
  value: string;
  size?: number;
}

const QRCodeComponent: React.FC<QRCodeProps> = ({ value, size = 256 }) => {
  return <QRCode value={value} size={size} />;
};

export default QRCodeComponent;
