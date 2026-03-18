'use client';

import { useEffect, useState } from 'react';
import {
    Button,
    Form,
    message,
    Modal,
    Spin,
    Tag,
} from 'antd';
import {
    ArrowLeftOutlined,
    BankOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    DollarOutlined,
    EditOutlined,
    EnvironmentOutlined,
    FileTextOutlined,
    TeamOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import JobPostModal from '../../../components/JobPostModal';
import { apiGetMe } from '../../../lib/authApi';
import {
    apiGetJobById,
    apiUpdateJob,
    apiDeleteJob,
    type Job as ApiJob,
} from '../../../lib/jobsApi';

interface Job {
    id: string;
    title: string;
    companyName: string;
    location: string;
    type: string;
    salary: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    benefits: string[];
    deadline: string;
    postedAt: string;
    category: string;
    experience: string;
    applicants: number;
}

const typeColors: Record<string, string> = {
    'Full-time': 'green',
    'Part-time': 'blue',
    Remote: 'purple',
    Contract: 'orange',
    Internship: 'cyan',
};

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function CompanyJobDetailPage() {
    const router = useRouter();
    const params = useParams();
    const jobId = params.id as string;

    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editForm] = Form.useForm();
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [aiLoading, setAiLoading] = useState<string | null>(null);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        const load = async () => {
            try {
                await apiGetMe();
            } catch {
                router.replace('/login');
                return;
            }
            try {
                const apiJob: ApiJob = await apiGetJobById(jobId);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const companyObj = apiJob.companyId as any;
                const companyName: string =
                    companyObj?.name ?? companyObj?.company ?? companyObj?.email ?? 'My Company';
                setJob({
                    id: apiJob._id,
                    title: apiJob.title,
                    companyName,
                    location: apiJob.location,
                    type: apiJob.type,
                    salary: apiJob.salary,
                    description: apiJob.description,
                    requirements: apiJob.requirements ?? [],
                    responsibilities: apiJob.responsibilities ?? [],
                    benefits: apiJob.benefits ?? [],
                    deadline: apiJob.deadline.substring(0, 10),
                    postedAt: apiJob.createdAt?.substring(0, 10) ?? '',
                    category: apiJob.category,
                    experience: apiJob.experience,
                    applicants: apiJob.applicants?.length ?? 0,
                });
            } catch {
                messageApi.error('Job not found.');
                router.push('/company');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [jobId, router, messageApi]);

    const handleEditClick = () => {
        if (!job) return;
        editForm.setFieldsValue({
            title: job.title,
            type: job.type,
            location: job.location,
            salary: job.salary,
            category: job.category,
            experience: job.experience,
            deadline: job.deadline,
            description: job.description,
            requirements: job.requirements.join('\n'),
            responsibilities: job.responsibilities.join('\n'),
            benefits: job.benefits.join('\n'),
        });
        setEditModalOpen(true);
    };

    const handleUpdateJob = async (values: Record<string, string>) => {
        if (!job) return;
        setEditSubmitting(true);
        try {
            const updated: ApiJob = await apiUpdateJob(job.id, {
                title: values.title,
                location: values.location,
                type: values.type as ApiJob['type'],
                salary: values.salary,
                description: values.description,
                category: values.category,
                experience: values.experience,
                deadline: values.deadline,
                requirements: values.requirements
                    ? values.requirements.split('\n').filter((r) => r.trim())
                    : [],
                responsibilities: values.responsibilities
                    ? values.responsibilities.split('\n').filter((r) => r.trim())
                    : [],
                benefits: values.benefits
                    ? values.benefits.split('\n').filter((r) => r.trim())
                    : [],
            });
            setJob((prev) =>
                prev
                    ? {
                        ...prev,
                        title: updated.title,
                        location: updated.location,
                        type: updated.type,
                        salary: updated.salary,
                        description: updated.description,
                        category: updated.category,
                        experience: updated.experience,
                        deadline: updated.deadline.substring(0, 10),
                        requirements: updated.requirements ?? [],
                        responsibilities: updated.responsibilities ?? [],
                        benefits: updated.benefits ?? [],
                    }
                    : null,
            );
            setEditModalOpen(false);
            editForm.resetFields();
            messageApi.success('Job updated successfully! ✅');
        } catch (err: unknown) {
            const e = err as { response?: { data?: { message?: string } }; message?: string };
            messageApi.error(e?.response?.data?.message || e?.message || 'Failed to update job');
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleDeleteJob = () => {
        Modal.confirm({
            title: 'Delete Job',
            content: `Are you sure you want to delete "${job?.title}"? This cannot be undone.`,
            okText: 'Delete',
            okButtonProps: { danger: true },
            onOk: async () => {
                setDeleting(true);
                try {
                    await apiDeleteJob(job!.id);
                    messageApi.success('Job deleted.');
                    router.push('/company');
                } catch (err: unknown) {
                    const e = err as { response?: { data?: { message?: string } }; message?: string };
                    messageApi.error(e?.response?.data?.message || e?.message || 'Failed to delete job');
                    setDeleting(false);
                }
            },
        });
    };

    const handleAiGenerate = async (
        field: 'description' | 'requirements' | 'responsibilities' | 'benefits',
    ) => {
        const values = editForm.getFieldsValue();
        const title = values.title || job?.title || 'this role';
        const type = values.type || job?.type || 'Full-time';
        const category = values.category || job?.category || 'Engineering';
        const experience = values.experience || job?.experience || '2-4 years';

        const prompts: Record<string, string> = {
            description: `Write a concise, professional job description (3-4 sentences) for a ${type} ${title} position in the ${category} department requiring ${experience} of experience. Use plain text, no markdown, no bullet points.`,
            requirements: `List 6 clear job requirements for a ${title} role in ${category} requiring ${experience} of experience. Output one requirement per line, no numbering, no markdown, no bullet symbols.`,
            responsibilities: `List 6 key responsibilities for a ${title} role in ${category}. Output one responsibility per line, no numbering, no markdown, no bullet symbols.`,
            benefits: `List 5 attractive employee benefits for a ${type} ${title} position. Output one benefit per line, no numbering, no markdown, no bullet symbols.`,
        };

        setAiLoading(field);
        try {
            const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
            if (!apiKey) throw new Error('NEXT_PUBLIC_GROQ_API_KEY is not set in .env.local');

            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'openai/gpt-oss-120b',
                    messages: [{ role: 'user', content: prompts[field] }],
                    max_tokens: 400,
                    temperature: 0.7,
                }),
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText);
            }

            const data = await res.json();
            const content: string = data.choices?.[0]?.message?.content?.trim() ?? '';
            editForm.setFieldsValue({ [field]: content });
            messageApi.success(`AI generated ${field} ✨`);
        } catch (err: unknown) {
            const e = err as Error;
            messageApi.error(`AI generation failed: ${e.message || 'Unknown error'}`);
        } finally {
            setAiLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="page-bg">
                <Navbar title="Job Details" />
                <div className="page-content flex items-center justify-center" style={{ minHeight: 400 }}>
                    <Spin size="large" />
                </div>
            </div>
        );
    }

    if (!job) return null;

    return (
        <div className="page-bg">
            {contextHolder}
            <Navbar title="Job Details" />

            <div className="page-content mx-auto w-full" style={{ maxWidth: 860 }}>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                >
                    {/* Back */}
                    <motion.div variants={fadeUp} className="mb-5">
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => router.push('/company')}
                            className="rounded-xl font-semibold"
                            style={{ color: '#6366f1', borderColor: '#c7d2fe', background: '#eef2ff' }}
                        >
                            Back to Dashboard
                        </Button>
                    </motion.div>

                    {/* Header Card */}
                    <motion.div variants={fadeUp}>
                        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm mb-5 overflow-hidden">
                            {/* Gradient banner */}
                            <div className="h-2 w-full bg-linear-to-r from-indigo-700 via-indigo-500 to-violet-500" />
                            <div className="p-5 sm:p-7">
                                <div className="flex flex-col sm:flex-row items-start gap-4">
                                    {/* Logo */}
                                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-700 to-indigo-500 flex items-center justify-center text-white text-2xl shadow-md shrink-0">
                                        <BankOutlined />
                                    </div>

                                    {/* Title & tags */}
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-1 wrap-break-word leading-tight">
                                            {job.title}
                                        </h1>
                                        <p className="text-indigo-600 font-semibold mb-3">{job.companyName}</p>
                                        <div className="flex flex-wrap gap-2">
                                            <Tag color={typeColors[job.type] || 'default'} className="rounded-full px-3 py-0.5 text-xs font-semibold">
                                                {job.type}
                                            </Tag>
                                            <Tag color="geekblue" className="rounded-full px-3 py-0.5 text-xs font-semibold">
                                                {job.category}
                                            </Tag>
                                            <Tag color="orange" className="rounded-full px-3 py-0.5 text-xs font-semibold">
                                                {job.experience}
                                            </Tag>
                                        </div>
                                    </div>

                                    {/* Applicants */}
                                    <div className="flex sm:flex-col flex-row items-center sm:items-end gap-3 sm:gap-2 w-full sm:w-auto shrink-0 pt-1">
                                        <div className="text-center sm:text-right">
                                            <div className="text-3xl font-extrabold text-indigo-600 leading-none">{job.applicants}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">Applicants</div>
                                        </div>
                                        <Button
                                            icon={<TeamOutlined />}
                                            size="medium"
                                            className="rounded-lg border-indigo-200 text-indigo-600 font-semibold"
                                            onClick={() => router.push(`/applicants/${job.id}`)}
                                        >
                                            View All
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Meta Grid */}
                    <motion.div variants={fadeUp}>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                            {[
                                { icon: <EnvironmentOutlined />, label: 'Location', value: job.location, color: 'text-indigo-500' },
                                { icon: <DollarOutlined />, label: 'Salary', value: job.salary, color: 'text-indigo-500' },
                                { icon: <ClockCircleOutlined />, label: 'Posted', value: job.postedAt, color: 'text-indigo-500' },
                                { icon: <CalendarOutlined />, label: 'Deadline', value: job.deadline, color: 'text-amber-500', highlight: true },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col items-center text-center gap-1"
                                >
                                    <span className={`text-xl ${item.color}`}>{item.icon}</span>
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{item.label}</span>
                                    <span className={`text-sm font-bold truncate w-full text-center ${item.highlight ? 'text-amber-500' : 'text-slate-800'}`}>
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Description */}
                    <motion.div variants={fadeUp}>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                                    <FileTextOutlined />
                                </span>
                                <h3 className="text-base font-bold text-slate-900 m-0">Job Description</h3>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed m-0">{job.description}</p>
                        </div>
                    </motion.div>

                    {/* Requirements */}
                    {job.requirements.length > 0 && (
                        <motion.div variants={fadeUp}>
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                                        <CheckCircleOutlined />
                                    </span>
                                    <h3 className="text-base font-bold text-slate-900 m-0">Requirements</h3>
                                </div>
                                <ul className="space-y-2 m-0 p-0 list-none">
                                    {job.requirements.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    )}

                    {/* Responsibilities */}
                    {job.responsibilities.length > 0 && (
                        <motion.div variants={fadeUp}>
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                                        <FileTextOutlined />
                                    </span>
                                    <h3 className="text-base font-bold text-slate-900 m-0">Responsibilities</h3>
                                </div>
                                <ul className="space-y-2 m-0 p-0 list-none">
                                    {job.responsibilities.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    )}

                    {/* Benefits */}
                    {job.benefits.length > 0 && (
                        <motion.div variants={fadeUp}>
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                                        <TrophyOutlined />
                                    </span>
                                    <h3 className="text-base font-bold text-slate-900 m-0">Benefits</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {job.benefits.map((b) => (
                                        <div
                                            key={b}
                                            className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3"
                                        >
                                            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                                            <span className="text-sm font-medium text-amber-800 leading-snug">{b}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Bottom Action Bar */}
                    <motion.div variants={fadeUp}>
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="text-sm text-slate-500 space-y-0.5">
                                    <div>
                                        Posted on:{' '}
                                        <span className="font-semibold text-slate-700">{job.postedAt}</span>
                                    </div>
                                    <div>
                                        Deadline:{' '}
                                        <span className="font-semibold text-amber-500">{job.deadline}</span>
                                    </div>
                                </div>
                                <div className="flex w-full sm:w-auto gap-3">
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        loading={deleting}
                                        onClick={handleDeleteJob}
                                        size="large"
                                        className="rounded-xl font-bold flex-1 sm:flex-none sm:w-36"
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        className="rounded-xl font-bold flex-1 sm:flex-none sm:w-36"
                                        size="large"
                                        onClick={handleEditClick}
                                    >
                                        Edit Job
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </motion.div>
            </div>

            {/* Edit Job Modal */}
            <JobPostModal
                open={editModalOpen}
                modalTitle={<><EditOutlined className="text-indigo-500" /> Edit Job</>}
                onCancel={() => { setEditModalOpen(false); editForm.resetFields(); }}
                onFinish={handleUpdateJob}
                form={editForm}
                submitting={editSubmitting}
                aiLoading={aiLoading}
                onAiGenerate={handleAiGenerate}
            />
        </div>
    );
}
