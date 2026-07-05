'use client';

import { Modal, Button, Typography, Space } from 'antd';
import { Phone } from 'lucide-react';
import { siteConfig } from '@/lib/site';

const { Text, Link: PhoneLink } = Typography;

/**
 * Phone-consultation modal for the header CTA — shows the office number (useful on
 * desktop, where you can't tap-to-call) with a direct call button below it.
 */
export function PhoneModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onCancel={onClose} footer={null} centered title="전화 상담">
      <Space orientation="vertical" size="middle" align="center" style={{ width: '100%', paddingBlock: 8 }}>
        <Text type="secondary">편하신 시간에 전화 주시면 친절히 안내해 드립니다.</Text>
        <PhoneLink href={siteConfig.phoneHref} style={{ fontSize: 30, fontWeight: 700 }}>
          {siteConfig.phone}
        </PhoneLink>
        <Text type="secondary">{siteConfig.businessHours}</Text>
        <Button
          type="primary"
          size="large"
          block
          href={siteConfig.phoneHref}
          icon={<Phone className="size-5" aria-hidden="true" />}
        >
          전화 걸기
        </Button>
      </Space>
    </Modal>
  );
}
