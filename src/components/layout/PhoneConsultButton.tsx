'use client';

import { useState } from 'react';
import { Button } from 'antd';
import type { ButtonProps } from 'antd';
import { PhoneModal } from './PhoneModal';

/**
 * A CTA button that reveals the office phone number in a modal — no call/SMS action.
 * Every "전화 상담" trigger uses this so the flow ends at simply showing the number.
 */
export function PhoneConsultButton({ children, ...buttonProps }: ButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button {...buttonProps} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <PhoneModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
