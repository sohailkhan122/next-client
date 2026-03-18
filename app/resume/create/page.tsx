'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Input, Row, Select, Spin, message } from 'antd';
import {
    DeleteOutlined,
    FileTextOutlined,
    PlusOutlined,
    RobotOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import { apiGetMe } from '../../lib/authApi';
import { apiGetMyStudentDetail, apiUpsertStudentDetail } from '../../lib/studentDetailApi';

const { Option } = Select;

interface ProjectFormValue {
    title: string;
    description: string;
    technologies?: string[];
    projectUrl?: string;
}

interface ResumeFormValues {
    requiredJob?: string;
    requiredExperience?: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    bio: string;
    experience: string;
    skills: string[];
    projects: ProjectFormValue[];
    degree: string;
    fieldOfStudy: string;
    institution: string;
    graduationYear: string;
    linkedIn?: string;
}

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const defaultProjects = [{ title: '', description: '', technologies: [], projectUrl: '' }];

export default function CreateResumePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isExistingResume, setIsExistingResume] = useState(false);
    const [aiLoadingField, setAiLoadingField] = useState<'bio' | 'experience' | null>(null);
    const [projectAiLoadingIndex, setProjectAiLoadingIndex] = useState<number | null>(null);
    const [form] = Form.useForm<ResumeFormValues>();

    useEffect(() => {
        const load = async () => {
            try {
                await apiGetMe();
            } catch {
                router.replace('/login');
                return;
            }

            try {
                const detail = await apiGetMyStudentDetail();
                const normalizedProjects = Array.isArray(detail?.projects)
                    ? detail.projects
                        .map((project: unknown): ProjectFormValue | null => {
                            if (!project || typeof project !== 'object') return null;
                            const typedProject = project as {
                                title?: unknown;
                                description?: unknown;
                                technology?: unknown;
                                technologies?: unknown;
                                url?: unknown;
                                projectUrl?: unknown;
                            };
                            const title = typeof typedProject.title === 'string' ? typedProject.title : '';
                            const description = typeof typedProject.description === 'string' ? typedProject.description : '';
                            const technologies = Array.isArray(typedProject.technologies)
                                ? typedProject.technologies
                                    .filter((item): item is string => typeof item === 'string')
                                    .map((item) => item.trim())
                                    .filter(Boolean)
                                : typeof typedProject.technology === 'string'
                                    ? typedProject.technology
                                        .split(',')
                                        .map((item) => item.trim())
                                        .filter(Boolean)
                                    : [];
                            const projectUrl = typeof typedProject.projectUrl === 'string'
                                ? typedProject.projectUrl
                                : typeof typedProject.url === 'string'
                                    ? typedProject.url
                                    : '';
                            if (!title.trim() && !description.trim()) return null;
                            return { title, description, technologies, projectUrl };
                        })
                        .filter((project: ProjectFormValue | null): project is ProjectFormValue => Boolean(project))
                    : [];

                form.setFieldsValue({
                    requiredJob: detail?.requiredJob ?? '',
                    requiredExperience: detail?.requiredExperience ?? '',
                    phone: detail?.phone ?? '',
                    dateOfBirth: detail?.dateOfBirth ? String(detail.dateOfBirth).substring(0, 10) : '',
                    gender: detail?.gender ?? '',
                    bio: detail?.bio ?? '',
                    experience: detail?.experience ?? '',
                    skills: Array.isArray(detail?.skills) ? detail.skills : [],
                    projects: normalizedProjects.length > 0 ? normalizedProjects : defaultProjects,
                    degree: detail?.degree ?? '',
                    fieldOfStudy: detail?.fieldOfStudy ?? '',
                    institution: detail?.institution ?? '',
                    graduationYear: detail?.graduationYear ? String(detail.graduationYear) : '',
                    linkedIn: detail?.linkedIn ?? '',
                });
                setIsExistingResume(true);
            } catch {
                form.resetFields();
                form.setFieldsValue({ projects: defaultProjects });
                setIsExistingResume(false);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [form, router]);

    const handleCancel = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
            return;
        }

        router.push('/student');
    };

    const handleAiGenerate = async (field: 'bio' | 'experience') => {
        const values = form.getFieldsValue();
        const skills = Array.isArray(values.skills)
            ? values.skills.map((skill) => skill.trim()).filter(Boolean)
            : [];
        const projectTitles = Array.isArray(values.projects)
            ? values.projects
                .map((project) => project?.title?.trim())
                .filter((title): title is string => Boolean(title))
            : [];

        const degree = values.degree?.trim() || 'a student degree';
        const fieldOfStudy = values.fieldOfStudy?.trim() || 'a relevant discipline';

        const prompts: Record<'bio' | 'experience', string> = {
            bio: `Write a professional summary for a student resume in 3-4 sentences. Candidate education: ${degree} in ${fieldOfStudy}. Skills: ${skills.join(', ') || 'communication, teamwork, problem solving'}. Project titles: ${projectTitles.join(', ') || 'academic projects'}. Use plain text, no markdown, no bullet points.`,
            experience: `Write an entry-level experience section for a student in 4-6 lines. Focus on internships, academic teamwork, freelance/class projects, and leadership contributions. Skills: ${skills.join(', ') || 'communication, teamwork, problem solving'}. Project titles: ${projectTitles.join(', ') || 'academic projects'}. Output plain text only, no markdown, no bullet symbols.`,
        };

        setAiLoadingField(field);
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
                    max_tokens: 350,
                    temperature: 0.7,
                }),
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText);
            }

            const data = await res.json();
            const content: string = data.choices?.[0]?.message?.content?.trim() ?? '';
            form.setFieldsValue({ [field]: content });
            message.success(field === 'bio' ? 'AI generated professional summary' : 'AI generated experience');
        } catch (err: unknown) {
            const error = err as Error;
            message.error(`AI generation failed: ${error.message || 'Unknown error'}`);
        } finally {
            setAiLoadingField(null);
        }
    };

    const handleProjectDescriptionAiGenerate = async (projectIndex: number) => {
        const values = form.getFieldsValue();
        const projects = Array.isArray(values.projects) ? values.projects : [];
        const selectedProject = projects[projectIndex];
        const projectTitle = selectedProject?.title?.trim();

        if (!projectTitle) {
            message.warning('Please enter the project name first');
            return;
        }

        const skills = Array.isArray(values.skills)
            ? values.skills.map((skill) => skill.trim()).filter(Boolean)
            : [];
        const degree = values.degree?.trim() || 'a student degree';
        const fieldOfStudy = values.fieldOfStudy?.trim() || 'a relevant discipline';

        const prompt = `Write a concise project description in 3-5 sentences for a resume project titled "${projectTitle}". Candidate education: ${degree} in ${fieldOfStudy}. Candidate skills: ${skills.join(', ') || 'problem solving, teamwork, communication'}. Include impact, technologies, and role. Use plain text only, no markdown, no bullet points.`;

        setProjectAiLoadingIndex(projectIndex);
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
                    messages: [{ role: 'user', content: prompt }],
                    max_tokens: 220,
                    temperature: 0.7,
                }),
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText);
            }

            const data = await res.json();
            const content: string = data.choices?.[0]?.message?.content?.trim() ?? '';
            const currentProjects = Array.isArray(form.getFieldValue('projects'))
                ? [...(form.getFieldValue('projects') as ProjectFormValue[])]
                : [];

            const currentItem = currentProjects[projectIndex] ?? { title: projectTitle, description: '', technologies: [], projectUrl: '' };
            currentProjects[projectIndex] = {
                ...currentItem,
                description: content,
            };

            form.setFieldsValue({ projects: currentProjects });
            message.success('AI generated project description');
        } catch (err: unknown) {
            const error = err as Error;
            message.error(`Project AI generation failed: ${error.message || 'Unknown error'}`);
        } finally {
            setProjectAiLoadingIndex(null);
        }
    };

    const handleCreateResume = async (values: ResumeFormValues) => {
        setSubmitting(true);
        try {
            const normalizedSkills = (values.skills ?? [])
                .map((skill) => skill.trim())
                .filter(Boolean);

            const normalizedProjects = (values.projects ?? [])
                .map((project) => ({
                    title: project?.title?.trim() ?? '',
                    description: project?.description?.trim() ?? '',
                    technologies: (project?.technologies ?? [])
                        .map((item) => item.trim())
                        .filter(Boolean),
                    projectUrl: project?.projectUrl?.trim() ?? '',
                }))
                .filter((project) => project.title || project.description);

            await apiUpsertStudentDetail({
                requiredJob: values.requiredJob?.trim() || undefined,
                requiredExperience: values.requiredExperience || undefined,
                phone: values.phone,
                dateOfBirth: values.dateOfBirth,
                gender: values.gender,
                bio: values.bio ?? '',
                experience: values.experience?.trim() ?? '',
                skills: normalizedSkills,
                projects: normalizedProjects,
                degree: values.degree,
                fieldOfStudy: values.fieldOfStudy,
                institution: values.institution,
                graduationYear: values.graduationYear,
                linkedIn: values.linkedIn?.trim() || undefined,
            });
            message.success('Resume details saved successfully');
            router.replace('/resume');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            const apiMessage = err.response?.data?.message;
            message.error(apiMessage || err.message || 'Failed to save resume details');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreateResumeFailed = () => {
        message.error('Please complete all required fields');
    };

    return (
        <div className="page-bg">
            <Navbar title={isExistingResume ? 'Update Resume' : 'Create Resume'} />

            <div className="page-content">
                <motion.section
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="student-hero"
                >
                    <div className="relative z-10 text-left">
                        <div className="max-w-2xl text-left">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-100">
                                <FileTextOutlined /> Resume Builder
                            </div>
                            <h1 className="student-hero-title mb-3 text-left">
                                {isExistingResume ? 'Update your resume details' : 'Create your resume in one place'}
                            </h1>
                            <p className="max-w-2xl text-sm leading-7 text-indigo-100/85">
                                Add your education, experience, skills, and projects here. You can use AI to draft sections and save everything directly to your resume preview.
                            </p>
                        </div>
                    </div>
                </motion.section>

                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.1 }}
                    className="w-full"
                >
                    <Card
                        style={{
                            borderRadius: 24,
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
                        }}
                        styles={{
                            body: { padding: 24 }
                        }}
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            requiredMark={false}
                            onFinish={handleCreateResume}
                            onFinishFailed={handleCreateResumeFailed}
                            scrollToFirstError
                            initialValues={{
                                projects: defaultProjects,
                            }}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center py-16">
                                    <Spin size="large" />
                                </div>
                            ) : (
                                <>
                                    <div className="mb-8 flex flex-col gap-2 border-b border-slate-100 pb-5">
                                        <h2 className="text-xl font-extrabold text-slate-900">
                                            {isExistingResume ? 'Edit resume details' : 'Start with your resume details'}
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            Everything you save here is used in your resume preview and can be updated any time.
                                        </p>
                                    </div>

                                    <section className="mb-8">
                                        <div className="mb-4">
                                            <h3 className="text-base font-bold text-slate-900">Personal details</h3>
                                            <p className="text-sm text-slate-500">Basic information that appears in your resume header.</p>
                                        </div>

                                        <Row gutter={14}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item name="requiredJob" label="Required Job">
                                                    <Input size="large" placeholder="e.g. Frontend Developer" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item name="requiredExperience" label="Experience">
                                                    <Select size="large" placeholder="Select experience">
                                                        <Option value="Fresher">Fresher</Option>
                                                        <Option value="0-1 Years">0-1 Years</Option>
                                                        <Option value="1-2 Years">1-2 Years</Option>
                                                        <Option value="2-3 Years">2-3 Years</Option>
                                                        <Option value="3+ Years">3+ Years</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={14}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Required' }]}>
                                                    <Input type="tel" size="large" placeholder="+92 300 0000000" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item name="dateOfBirth" label="Date of Birth" rules={[{ required: true, message: 'Required' }]}>
                                                    <Input type="date" size="large" />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={14}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item name="gender" label="Gender" rules={[{ required: true, message: 'Required' }]}>
                                                    <Select size="large" placeholder="Select gender">
                                                        <Option value="male">Male</Option>
                                                        <Option value="female">Female</Option>
                                                        <Option value="other">Other</Option>
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item name="linkedIn" label="LinkedIn">
                                                    <Input size="large" placeholder="https://linkedin.com/in/username" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </section>

                                    <section className="mb-8">
                                        <div className="mb-4">
                                            <h3 className="text-base font-bold text-slate-900">Education</h3>
                                            <p className="text-sm text-slate-500">Include your latest degree and expected graduation details.</p>
                                        </div>

                                        <Row gutter={14}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item name="degree" label="Degree" rules={[{ required: true, message: 'Required' }]}>
                                                    <Input size="large" placeholder="e.g. Bachelor's" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item name="fieldOfStudy" label="Field of Study" rules={[{ required: true, message: 'Required' }]}>
                                                    <Input size="large" placeholder="e.g. Computer Science" />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        <Row gutter={14}>
                                            <Col xs={24} sm={12}>
                                                <Form.Item name="institution" label="Institution" rules={[{ required: true, message: 'Required' }]}>
                                                    <Input size="large" placeholder="University / College name" />
                                                </Form.Item>
                                            </Col>
                                            <Col xs={24} sm={12}>
                                                <Form.Item name="graduationYear" label="Graduation Year" rules={[{ required: true, message: 'Required' }]}>
                                                    <Input size="large" placeholder="e.g. 2027" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </section>

                                    <section className="mb-8">
                                        <div className="mb-4">
                                            <h3 className="text-base font-bold text-slate-900">Skills and summary</h3>
                                            <p className="text-sm text-slate-500">Add your strongest skills and a short professional introduction.</p>
                                        </div>

                                        <Form.Item name="skills" label="Skills">
                                            <Select
                                                mode="tags"
                                                size="large"
                                                placeholder="Type a skill and press Enter"
                                                tokenSeparators={[',']}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            name="bio"
                                            label={
                                                <div className="flex items-center justify-between gap-2 min-w-70">
                                                    <span>Professional Summary</span>
                                                    <Button
                                                        type="link"
                                                        size="small"
                                                        icon={<RobotOutlined />}
                                                        loading={aiLoadingField === 'bio'}
                                                        onClick={() => handleAiGenerate('bio')}
                                                    >
                                                        Generate AI
                                                    </Button>
                                                </div>
                                            }
                                            rules={[{ required: true, message: 'Required' }]}
                                        >
                                            <Input.TextArea rows={4} placeholder="Write a short summary about your profile..." />
                                        </Form.Item>

                                        <Form.Item
                                            name="experience"
                                            label={
                                                <div className="flex items-center justify-between gap-2 min-w-70">
                                                    <span>Basic Experience</span>
                                                    <Button
                                                        type="link"
                                                        size="small"
                                                        icon={<RobotOutlined />}
                                                        loading={aiLoadingField === 'experience'}
                                                        onClick={() => handleAiGenerate('experience')}
                                                    >
                                                        Generate AI Experience
                                                    </Button>
                                                </div>
                                            }
                                            rules={[{ required: true, message: 'Required' }]}
                                        >
                                            <Input.TextArea
                                                rows={4}
                                                placeholder="Add internships, academic projects, or student leadership experience..."
                                            />
                                        </Form.Item>
                                    </section>

                                    <section className="mb-2">
                                        <div className="mb-4">
                                            <h3 className="text-base font-bold text-slate-900">Projects</h3>
                                            <p className="text-sm text-slate-500">List projects that demonstrate your impact and technical range.</p>
                                        </div>

                                        <Form.List name="projects">
                                            {(fields, { add, remove }) => (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="font-semibold text-slate-700">Project entries</div>
                                                        <Button
                                                            type="dashed"
                                                            size="small"
                                                            icon={<PlusOutlined />}
                                                            onClick={() => add({ title: '', description: '', technologies: [], projectUrl: '' })}
                                                        >
                                                            Add Project
                                                        </Button>
                                                    </div>

                                                    {fields.map((field, index) => (
                                                        <Card
                                                            key={field.key}
                                                            size="small"
                                                            style={{ borderRadius: 16, border: '1px solid #e2e8f0' }}
                                                            styles={{
                                                                body: { padding: 16 }
                                                            }}
                                                        >
                                                            <div className="mb-3 flex items-center justify-between">
                                                                <div className="text-sm font-semibold text-slate-700">Project {index + 1}</div>
                                                                <Button
                                                                    danger
                                                                    type="text"
                                                                    size="small"
                                                                    icon={<DeleteOutlined />}
                                                                    onClick={() => remove(field.name)}
                                                                    disabled={fields.length === 1}
                                                                >
                                                                    Remove
                                                                </Button>
                                                            </div>

                                                            <Form.Item
                                                                name={[field.name, 'title']}
                                                                label="Project Name"
                                                                rules={[{ required: true, message: 'Required' }]}
                                                            >
                                                                <Input size="large" placeholder="e.g. Job Portal Web App" />
                                                            </Form.Item>

                                                            <Row gutter={14}>
                                                                <Col xs={24} sm={12}>
                                                                    <Form.Item
                                                                        name={[field.name, 'technologies']}
                                                                        label="Technologies"
                                                                    >
                                                                        <Select
                                                                            mode="tags"
                                                                            size="large"
                                                                            placeholder="Type a technology and press Enter"
                                                                            tokenSeparators={[',']}
                                                                        />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col xs={24} sm={12}>
                                                                    <Form.Item
                                                                        name={[field.name, 'projectUrl']}
                                                                        label="Project URL"
                                                                    >
                                                                        <Input size="large" placeholder="https://github.com/..." />
                                                                    </Form.Item>
                                                                </Col>
                                                            </Row>

                                                            <Form.Item
                                                                name={[field.name, 'description']}
                                                                label={
                                                                    <div className="flex items-center justify-between gap-2 min-w-70">
                                                                        <span>Project Description</span>
                                                                        <Button
                                                                            type="link"
                                                                            size="small"
                                                                            icon={<RobotOutlined />}
                                                                            loading={projectAiLoadingIndex === index}
                                                                            onClick={() => handleProjectDescriptionAiGenerate(index)}
                                                                        >
                                                                            Generate AI
                                                                        </Button>
                                                                    </div>
                                                                }
                                                                rules={[{ required: true, message: 'Required' }]}
                                                                style={{ marginBottom: 0 }}
                                                            >
                                                                <Input.TextArea rows={3} placeholder="Describe what you built and your contribution..." />
                                                            </Form.Item>
                                                        </Card>
                                                    ))}
                                                </div>
                                            )}
                                        </Form.List>
                                    </section>

                                    <div className="mt-8 flex flex-col-reverse justify-end gap-3 sm:flex-row">
                                        <Button size="large" onClick={handleCancel} disabled={submitting}>
                                            Cancel
                                        </Button>
                                        <Button
                                            type="primary"
                                            htmlType="button"
                                            onClick={() => form.submit()}
                                            size="large"
                                            loading={submitting}
                                            className="submit-btn"
                                            style={{ minWidth: 190 }}
                                        >
                                            {submitting ? 'Saving...' : 'Save & Preview Resume'}
                                        </Button>
                                    </div>

                                </>
                            )}
                        </Form>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}