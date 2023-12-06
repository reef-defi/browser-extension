import QRCode from 'qrcode.react';
import React from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
}

const QRCodeComponent: React.FC<QRCodeProps> = ({ size = 384, value }) => {
  return (
    <div style={{ display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'white',
      padding: '10px' ,
      borderRadius:'10px'}}>
      <QRCode
        value={value}
        size={size}
        bgColor='#FFFFFF'
      />
    </div>
  );
};

export default QRCodeComponent;
