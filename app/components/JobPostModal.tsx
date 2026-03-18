'use client';

import React from 'react';
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
} from 'antd';
import type { FormInstance } from 'antd';
import { PlusOutlined, RobotOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

interface JobPostModalProps {
  open: boolean;
  onCancel: () => void;
  onFinish: (values: Record<string, string>) => Promise<void>;
  form: FormInstance;
  submitting: boolean;
  aiLoading: string | null;
  onAiGenerate: (field: 'description' | 'requirements' | 'responsibilities' | 'benefits') => Promise<void>;
  modalTitle?: React.ReactNode;
}

export default function JobPostModal({
  open,
  onCancel,
  onFinish,
  form,
  submitting,
  aiLoading,
  onAiGenerate,
  modalTitle,
}: JobPostModalProps) {
  return (
    <Modal
      title={
        <div className="flex items-center gap-2.5 text-lg font-extrabold">
          {modalTitle ?? <><PlusOutlined className="text-indigo-500" /> Post a New Job</>}
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={660}
      style={{ top: 20 }}
      styles={{ body: { maxHeight: '85vh', overflowY: 'auto', paddingRight: 8 } }}
      classNames={{ body: 'modal-scroll' }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={false}
        className="mt-4"
      >
        <Row gutter={14}>
          <Col xs={24} sm={14}>
            <Form.Item name="title" label="Job Title" rules={[{ required: true, message: 'Required' }]}>
              <Input placeholder="e.g. Senior Frontend Developer" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={10}>
            <Form.Item name="type" label="Job Type" rules={[{ required: true, message: 'Required' }]}>
              <Select size="large" placeholder="Select type">
                {['Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'].map((t) => (
                  <Option key={t} value={t}>{t}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={14}>
          <Col xs={24} sm={12}>
            <Form.Item name="location" label="Location" rules={[{ required: true }]}>
              <Input placeholder="e.g. Karachi, Pakistan" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="salary" label="Salary Range" rules={[{ required: true, message: 'Required' }]}>
              <Select size="large" placeholder="Select salary range">
                {[
                  'Under $30,000',
                  '$30,000 – $50,000',
                  '$50,000 – $70,000',
                  '$70,000 – $90,000',
                  '$90,000 – $120,000',
                  '$120,000 – $150,000',
                  '$150,000 – $200,000',
                  '$200,000+',
                  'PKR 50,000 – 100,000/mo',
                  'PKR 100,000 – 150,000/mo',
                  'PKR 150,000 – 250,000/mo',
                  'PKR 250,000+/mo',
                  'Competitive / Negotiable',
                ].map((s) => (
                  <Option key={s} value={s}>{s}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={14}>
          <Col xs={24} sm={12}>
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Select size="large" placeholder="Select category">
                {['Engineering', 'Design', 'Product', 'Marketing', 'Data & AI', 'Finance', 'HR', 'Sales'].map((c) => (
                  <Option key={c} value={c}>{c}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="experience" label="Experience Required" rules={[{ required: true }]}>
              <Select size="large" placeholder="Select experience">
                {['Entry level', '1–2 years', '2–4 years', '4+ years', '5+ years', '7+ years'].map((e) => (
                  <Option key={e} value={e}>{e}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="deadline" label="Application Deadline" rules={[{ required: true }]}>
          <Input type="date" size="large" />
        </Form.Item>
        <Form.Item
          name="description"
          label={
            <div className="flex w-full justify-between items-center">
              <span>Job Description</span>
              <Button
                size="small"
                type="dashed"
                icon={<RobotOutlined className="text-indigo-500" />}
                loading={aiLoading === 'description'}
                onClick={(e) => { e.preventDefault(); onAiGenerate('description'); }}
                className="text-xs text-indigo-500 border-indigo-300"
                style={{ height: 26 }}
              >
                AI Generate
              </Button>
            </div>
          }
          rules={[{ required: true }]}
        >
          <TextArea rows={3} placeholder="Describe the role, team, and what you're looking for..." />
        </Form.Item>
        <Form.Item
          name="requirements"
          label={
            <div className="flex w-full justify-between items-center">
              <span>Requirements (one per line)</span>
              <Button
                size="small"
                type="dashed"
                icon={<RobotOutlined className="text-indigo-500" />}
                loading={aiLoading === 'requirements'}
                onClick={(e) => { e.preventDefault(); onAiGenerate('requirements'); }}
                className="text-xs text-indigo-500 border-indigo-300"
                style={{ height: 26 }}
              >
                AI Generate
              </Button>
            </div>
          }
        >
          <TextArea rows={3} placeholder={`5+ years React experience\nStrong TypeScript skills\n...`} />
        </Form.Item>
        <Form.Item
          name="responsibilities"
          label={
            <div className="flex w-full justify-between items-center">
              <span>Responsibilities (one per line)</span>
              <Button
                size="small"
                type="dashed"
                icon={<RobotOutlined className="text-indigo-500" />}
                loading={aiLoading === 'responsibilities'}
                onClick={(e) => { e.preventDefault(); onAiGenerate('responsibilities'); }}
                className="text-xs text-indigo-500 border-indigo-300"
                style={{ height: 26 }}
              >
                AI Generate
              </Button>
            </div>
          }
        >
          <TextArea rows={3} placeholder={`Build scalable features\nCode reviews\n...`} />
        </Form.Item>
        <Form.Item
          name="benefits"
          label={
            <div className="flex w-full justify-between items-center">
              <span>Benefits (one per line)</span>
              <Button
                size="small"
                type="dashed"
                icon={<RobotOutlined className="text-indigo-500" />}
                loading={aiLoading === 'benefits'}
                onClick={(e) => { e.preventDefault(); onAiGenerate('benefits'); }}
                className="text-xs text-indigo-500 border-indigo-300"
                style={{ height: 26 }}
              >
                AI Generate
              </Button>
            </div>
          }
        >
          <TextArea rows={2} placeholder={`Health insurance\nRemote work\n...`} />
        </Form.Item>
        <div className="flex gap-3 justify-end mt-2">
          <Button size="large" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={submitting}
            className="submit-btn"
            style={{ width: 160 }}
          >
            {submitting ? 'Posting...' : 'Post Job'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
