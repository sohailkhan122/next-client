import React from 'react';
import { Document, Link as PdfLink, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

export interface PdfStudentDetail {
  requiredJob?: string;
  requiredExperience?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  experience?: string;
  skills?: string[];
  degree?: string;
  fieldOfStudy?: string;
  institution?: string;
  graduationYear?: string;
  linkedIn?: string;
  location?: string;
}

export interface NormalizedProject {
  title: string;
  description: string;
  technologies: string[];
  projectUrl: string;
}

interface ResumePdfDocumentProps {
  displayName: string;
  displayEmail: string;
  detail: PdfStudentDetail | null;
  isViewingOther: boolean;
  roleLabel: string;
  normalizedProjects: NormalizedProject[];
}

function truncateText(value: string, maxChars: number) {
  if (value.length <= maxChars) {
    return value;
  }
  return `${value.slice(0, maxChars - 3).trimEnd()}...`;
}

const pdfStyles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#1f2937',
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 22,
    lineHeight: 1.4,
  },
  header: {
    backgroundColor: '#4338ca',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  headerTopName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#6366f1',
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  headerRight: {
    width: '42%',
    borderLeftWidth: 1,
    borderLeftColor: '#6366f1',
    paddingLeft: 10,
  },
  headerName: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 600,
    lineHeight: 1.3,
  },
  headerRole: {
    color: '#ffffff',
    fontSize: 10,
    marginTop: 0,
    fontWeight: 600,
  },
  headerSubRole: {
    color: '#dbeafe',
    fontSize: 9,
    marginTop: 2,
  },
  headerMeta: {
    color: '#e0e7ff',
    fontSize: 9,
    marginTop: 3,
  },
  headerValue: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 600,
  },
  headerContactWrap: {
    marginTop: 0,
  },
  headerContact: {
    color: '#ffffff',
    fontSize: 9,
    marginTop: 3,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: '#4338ca',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.6,
  },
  paragraph: {
    fontSize: 9,
    color: '#334155',
    lineHeight: 1.45,
    whiteSpace: 'pre-wrap',
  },
  card: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  strong: {
    fontWeight: 700,
    color: '#0f172a',
  },
  muted: {
    color: '#64748b',
    fontSize: 9,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  infoItem: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 6,
  },
  infoLabel: {
    color: '#64748b',
    fontSize: 8,
  },
  infoValue: {
    color: '#1e293b',
    fontSize: 9,
    fontWeight: 600,
    marginTop: 1,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillTag: {
    borderRadius: 999,
    backgroundColor: '#eef2ff',
    color: '#4338ca',
    fontSize: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  projectCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 6,
  },
  projectTitle: {
    fontWeight: 700,
    color: '#0f172a',
    flex: 1,
  },
  techWrap: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  techTag: {
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
    borderRadius: 999,
    fontSize: 7,
    paddingVertical: 1,
    paddingHorizontal: 5,
  },
  projectLink: {
    color: '#4338ca',
    fontSize: 8,
    fontWeight: 700,
  },
  footer: {
    position: 'absolute',
    bottom: 8,
    left: 22,
    right: 22,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 7,
  },
});

export default function ResumePdfDocument({
  displayName,
  displayEmail,
  detail,
  isViewingOther,
  roleLabel,
  normalizedProjects,
}: ResumePdfDocumentProps) {
  const currentYear = new Date().getFullYear();
  const gradYear = detail?.graduationYear ? Number(detail.graduationYear) : null;
  const isGraduated = gradYear !== null && gradYear <= currentYear;
  const limitedSkills = (detail?.skills ?? []).slice(0, 16);
  const limitedProjects = normalizedProjects.slice(0, 3);
  const shortBio = truncateText((detail?.bio ?? '').trim(), 380);
  const shortExperience = truncateText((detail?.experience ?? '').trim(), 620);
  const generatedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document title={`${displayName || 'Resume'} Resume`}>
      <Page size="A4" style={pdfStyles.page} wrap={false}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.headerTopName}>{displayName || 'Your Name'}</Text>
          <View style={pdfStyles.headerRow}>
            <View style={pdfStyles.headerLeft}>
              <Text style={pdfStyles.headerRole}>
                Required Job: <Text style={pdfStyles.headerValue}>{detail?.requiredJob || roleLabel || '-'}</Text>
              </Text>
              <Text style={pdfStyles.headerMeta}>
                Experience: <Text style={pdfStyles.headerValue}>{detail?.requiredExperience || '-'}</Text>
              </Text>
              <Text style={pdfStyles.headerMeta}>
                Education: <Text style={pdfStyles.headerValue}>{detail?.degree && detail?.fieldOfStudy ? `${detail.degree} · ${detail.fieldOfStudy}` : detail?.degree || '-'}</Text>
              </Text>
            </View>

            <View style={pdfStyles.headerRight}>
              <View style={pdfStyles.headerContactWrap}>
                <Text style={pdfStyles.headerContact}>Email: {displayEmail || '-'}</Text>
                <Text style={pdfStyles.headerContact}>LinkedIn: {detail?.linkedIn || '-'}</Text>
                <Text style={pdfStyles.headerContact}>Phone: {detail?.phone || '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        {shortBio && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Objective</Text>
            <Text style={pdfStyles.paragraph}>{shortBio}</Text>
          </View>
        )}

        {(detail?.institution || detail?.degree) && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Education</Text>
            <View style={pdfStyles.card}>
              <View style={pdfStyles.row}>
                <View>
                  <Text style={pdfStyles.strong}>
                    {detail?.degree ?? '-'}
                    {detail?.fieldOfStudy ? ` in ${detail.fieldOfStudy}` : ''}
                  </Text>
                  <Text style={pdfStyles.muted}>{detail?.institution ?? '-'}</Text>
                </View>
                {detail?.graduationYear ? (
                  <Text style={pdfStyles.muted}>
                    {isGraduated ? `Graduated ${detail.graduationYear}` : `Expected ${detail.graduationYear}`}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        )}

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Personal Information</Text>
          <View style={pdfStyles.infoGrid}>
            {detail?.gender ? (
              <View style={pdfStyles.infoItem}>
                <Text style={pdfStyles.infoLabel}>Gender</Text>
                <Text style={pdfStyles.infoValue}>{detail.gender}</Text>
              </View>
            ) : null}
            {detail?.dateOfBirth ? (
              <View style={pdfStyles.infoItem}>
                <Text style={pdfStyles.infoLabel}>Date of Birth</Text>
                <Text style={pdfStyles.infoValue}>{detail.dateOfBirth}</Text>
              </View>
            ) : null}
            {!isViewingOther && roleLabel ? (
              <View style={pdfStyles.infoItem}>
                <Text style={pdfStyles.infoLabel}>Role</Text>
                <Text style={pdfStyles.infoValue}>{roleLabel}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {shortExperience && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Experience</Text>
            <Text style={pdfStyles.paragraph}>{shortExperience}</Text>
          </View>
        )}

        {limitedSkills.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Skills</Text>
            <View style={pdfStyles.skillsWrap}>
              {limitedSkills.map((skill) => (
                <Text key={skill} style={pdfStyles.skillTag}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        )}

        {limitedProjects.length > 0 && (
          <View style={pdfStyles.section}>
            <Text style={pdfStyles.sectionTitle}>Projects</Text>
            {limitedProjects.map((project, index) => (
              <View key={`${project.title || 'project'}-${index}`} style={pdfStyles.projectCard}>
                <View style={pdfStyles.projectHeader}>
                  {project.title ? <Text style={pdfStyles.projectTitle}>{project.title}</Text> : <Text style={pdfStyles.projectTitle}>Project</Text>}
                  {project.projectUrl ? (
                    <PdfLink src={project.projectUrl} style={pdfStyles.projectLink}>
                      View Project
                    </PdfLink>
                  ) : null}
                </View>
                {project.technologies.length > 0 && (
                  <View style={pdfStyles.techWrap}>
                    {project.technologies.map((tech) => (
                      <Text key={tech} style={pdfStyles.techTag}>
                        {tech}
                      </Text>
                    ))}
                  </View>
                )}
                {project.description ? <Text style={[pdfStyles.paragraph, { marginTop: 3 }]}>{truncateText(project.description, 220)}</Text> : null}
              </View>
            ))}
          </View>
        )}

        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>Generated {generatedDate}</Text>
          <Text
            style={pdfStyles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
