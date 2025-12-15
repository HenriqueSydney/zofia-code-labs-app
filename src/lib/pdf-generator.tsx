import React from "react";
import {
  Document,
  Link,
  Page,
  pdf,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import { Certifications } from "@/services/notion/getCertificationsFromNotion";
import { Experience } from "@/services/notion/getExperienceFromNotion";
import { ProfileStats } from "@/services/notion/getProfileStatsFromNotion";
import { Skills } from "@/services/notion/getSkillsFromNotion";
import { envVariables } from "@/env";
import { Graduation } from "@/services/notion/getGraduationFromNotion";
import { BasicInfo } from "@/services/notion/getBasicInfoFromNotion";
import { Projects } from "@/services/notion/getProjectsFromNotion";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.4,
    color: "#333333",
  },

  // Header Styles
  header: {
    marginBottom: 25,
    alignItems: "center",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 16,
    textAlign: "center",
  },
  profession: {
    fontSize: 16,
    color: "#4a5568",
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
  contactInfo: {
    fontSize: 11,
    color: "#666666",
    textAlign: "center",
    lineHeight: 1.3,
  },

  // Section Styles
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    borderBottom: "1pt solid #e2e8f0",
    paddingBottom: 4,
  },

  // Content Styles
  paragraph: {
    fontSize: 11,
    lineHeight: 1.5,
    color: "#4a5568",
    textAlign: "justify",
    marginBottom: 8,
  },

  // Experience Styles
  experienceItem: {
    marginBottom: 16,
    paddingLeft: 8,
  },
  jobTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 3,
  },
  company: {
    fontSize: 12,
    color: "#4a5568",
    fontWeight: "bold",
    marginBottom: 2,
  },
  period: {
    fontSize: 10,
    color: "#718096",
    marginBottom: 8,
    fontStyle: "italic",
  },
  description: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#4a5568",
    textAlign: "justify",
  },

  // Skills Styles
  skillsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  skillCategory: {
    flex: 1,
    minWidth: "45%",
    marginBottom: 10,
  },
  skillCategoryTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2d3748",
    marginBottom: 6,
  },
  skillTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  skillTag: {
    fontSize: 9,
    backgroundColor: "#edf2f7",
    color: "#4a5568",
    padding: "3px 8px",
    borderRadius: 2,
    marginBottom: 3,
  },

  // Education & Certifications
  listItem: {
    fontSize: 11,
    color: "#4a5568",
    marginBottom: 6,
    paddingLeft: 12,
    lineHeight: 1.4,
  },
  bulletPoint: {
    fontSize: 11,
    color: "#4a5568",
    marginBottom: 4,
    paddingLeft: 0,
    lineHeight: 1.4,
    marginLeft: 2,
  },

  // Subsection
  subsectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2d3748",
    marginTop: 12,
    marginBottom: 8,
  },

  // Footer
  footer: {
    marginTop: 20,
    alignItems: "center",
    borderTop: "1pt solid #e2e8f0",
    paddingTop: 12,
  },
  footerText: {
    fontSize: 11,
    color: "#4a5568",
    fontWeight: "bold",
    marginBottom: 4,
  },
  link: {
    fontSize: 11,
    color: "#3182ce",
    textDecoration: "underline",
  },
});

export interface IResumeDocument {
  basicInfo: BasicInfo;
  profileStats: ProfileStats[];
  skills: Skills[];
  certifications: Certifications;
  experience: Experience[];
  graduations: Graduation[];
  projects: Projects[];
  t: any;
}

const ResumeDocument = ({
  basicInfo,
  certifications,
  experience,
  skills,
  graduations,
  projects,
  t,
}: IResumeDocument) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{basicInfo.name}</Text>
          <Text style={styles.profession}>{basicInfo.profession}</Text>
          <Text style={styles.contactInfo}>
            {basicInfo.age} {t("years")} | {basicInfo.address} |{" "}
            {basicInfo.phoneNumber} | {basicInfo.email}
          </Text>
        </View>

        {/* Resumo Profissional */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {" "}
            {t("professionalExcerptTitle")}
          </Text>
          <Text style={styles.paragraph}>{basicInfo.excerpt}</Text>
        </View>

        {/* Formação Acadêmica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> {t("academicTitlesTitle")}</Text>
          {graduations.map((graduation, index, graduations) => (
            <Text key={graduation.id} style={styles.bulletPoint}>
              • {graduation.name} – {graduation.institution} (
              {graduation.finished})
              {index === graduations.length + 1 ? "." : ";"}
            </Text>
          ))}
        </View>

        {/* Experiência Profissional */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {" "}
            {t("professionalExperienceTitle")}
          </Text>
          {experience.map((exp, index) => (
            <View key={index}>
              <Text style={[styles.bulletPoint, { fontWeight: "bold" }]}>
                • {exp.title} – {exp.company} – {exp.period}
              </Text>
              {exp.description && (
                <Text
                  style={[
                    styles.description,
                    { marginLeft: 12, marginBottom: 8 },
                  ]}
                >
                  {exp.description}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Conhecimentos Técnicos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> {t("thecnicalKnowledge")}</Text>
          {skills.map((skillGroup, index) => (
            <View key={index} style={{ marginBottom: 2 }}>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                }}
              >
                <Text style={[styles.bulletPoint, { fontWeight: "bold" }]}>
                  • {skillGroup.category}:{" "}
                  {skillGroup.stack.map((skill, skillIndex) => (
                    <Text
                      key={skill.id}
                      style={[styles.description, { fontWeight: "normal" }]}
                    >
                      {skill.label}
                      {skillIndex < skillGroup.stack.length - 1 ? ", " : ";"}
                    </Text>
                  ))}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Cursos e Certificações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("coursesAndCertificationsTitle")}
          </Text>

          {certifications.certifications.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>
                {" "}
                {t("certificationTitle")}
              </Text>
              <View
                style={{
                  marginLeft: 16,
                }}
              >
                {certifications.certifications.slice(0, 5).map((cert) => (
                  <Text key={cert.id} style={styles.bulletPoint}>
                    • {cert.description}
                  </Text>
                ))}
                {certifications.certifications.length > 5 && (
                  <Text style={styles.bulletPoint}>
                    • {t("andMore")}{" "}
                    {
                      <Link
                        src={`${envVariables.BASE_URL}/#certifications`}
                        style={styles.link}
                      >
                        henriquelima.pro
                      </Link>
                    }
                    )...
                  </Text>
                )}
              </View>
            </>
          )}

          <Text style={styles.subsectionTitle}> {t("coursesTitle")}</Text>
          <View
            style={{
              marginLeft: 16,
            }}
          >
            {certifications.courses.slice(0, 7).map((course) => (
              <Text key={course.id} style={styles.bulletPoint}>
                • {course.description}
              </Text>
            ))}
            {certifications.courses.length > 8 && (
              <Text style={styles.bulletPoint}>
                • {t("andMore")}{" "}
                {
                  <Link
                    src={`${envVariables.BASE_URL}/#certifications`}
                    style={styles.link}
                  >
                    henriquelima.pro
                  </Link>
                }
                )...
              </Text>
            )}
          </View>
        </View>

        {/* Projetos Relevantes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> {t("relevantProjectsTitle")}</Text>
          {projects.map((project) => (
            <View style={{ marginBottom: 16 }}>
              <Text key={project.id} style={styles.subsectionTitle}>
                {project.name}:
              </Text>
              <View
                style={{
                  marginLeft: 16,
                }}
              >
                {project.bullets.map((bullet) => (
                  <Text style={styles.bulletPoint}> • {bullet}</Text>
                ))}
                <View
                  style={{ flex: 1, flexDirection: "row", flexWrap: "wrap" }}
                >
                  <Text style={{ ...styles.paragraph, fontWeight: "bold" }}>
                    Stacks:{" "}
                  </Text>
                  <Text style={styles.description}>
                    {project.stacks.join(", ")};
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t("moreInformation")}</Text>
          <Link src={`${envVariables.BASE_URL}`} style={styles.link}>
            henriquelima.pro
          </Link>
        </View>
      </Page>
    </Document>
  );
};

export async function generateResumePDF(
  data: IResumeDocument
): Promise<Buffer> {
  const doc = <ResumeDocument {...data} />;
  const pdfBlob = await pdf(doc).toBlob();
  const arrayBuffer = await pdfBlob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
