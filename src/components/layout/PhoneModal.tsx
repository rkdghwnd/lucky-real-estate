'use client';

import { Modal, Typography, Space } from 'antd';
import { siteConfig } from '@/lib/site';

const { Text } = Typography;

/**
 * Phone-consultation modal — shows the office number so the visitor can dial it
 * themselves. No call/SMS action buttons: the flow ends at displaying the number.
 */
export function PhoneModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onCancel={onClose} footer={null} centered title="전화 상담">
      <Space orientation="vertical" size="middle" align="center" style={{ width: '100%', paddingBlock: 8 }}>
        <Text type="secondary">편하신 시간에 아래 번호로 전화 주시면 친절히 안내해 드립니다.</Text>
        <Text strong style={{ fontSize: 32, color: 'var(--color-brand)' }}>
          {siteConfig.phone}
        </Text>
        <Text type="secondary">{siteConfig.businessHours}</Text>
      </Space>
    </Modal>
  );
}
