import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(props: ButtonProps) {
  return (
    <button
      {...props}
      style={{
        background: '#6E4023',
        color: '#FFFFFF',
        border: 0,
        borderRadius: 10,
        padding: '10px 14px',
        cursor: 'pointer'
      }}
    />
  );
}
