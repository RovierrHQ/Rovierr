'use client'

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { ResumeData } from '@rov/orpc-contracts'

const AzurillTemplate = ({ resumeData }: { resumeData: ResumeData }) => {
  const styles = StyleSheet.create({
    body: {
      paddingTop: 35,
      paddingBottom: 35,
      paddingHorizontal: 35,
      fontFamily: 'Helvetica',
      fontSize: 11
    },
    section: {
      marginBottom: 15
    },
    header: {
      fontSize: 20,
      textAlign: 'center',
      fontWeight: 'bold',
      marginBottom: 5
    },
    subheader: {
      fontSize: 14,
      color: '#2563eb',
      marginBottom: 8,
      textAlign: 'left',
      borderBottom: '1px solid #2563eb',
      paddingBottom: 2
    },
    text: {
      fontSize: 11,
      marginBottom: 5,
      textAlign: 'left'
    },
    contactInfo: {
      fontSize: 10,
      textAlign: 'center',
      marginBottom: 10
    },
    itemTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 2
    },
    itemSubtitle: {
      fontSize: 10,
      color: '#666',
      marginBottom: 2
    },
    itemDescription: {
      fontSize: 10,
      marginBottom: 8
    }
  })

  return (
    <Document>
      <Page size="A4" style={styles.body}>
        {/* Basic Info Section */}
        {resumeData.basicInfo && (
          <View style={styles.section}>
            <Text style={styles.header}>{resumeData.basicInfo.name}</Text>
            <Text style={styles.contactInfo}>
              {resumeData.basicInfo.email && `${resumeData.basicInfo.email} | `}
              {resumeData.basicInfo.phone && `${resumeData.basicInfo.phone} | `}
              {resumeData.basicInfo.location && resumeData.basicInfo.location}
            </Text>
            {resumeData.basicInfo.summary && (
              <Text style={styles.text}>{resumeData.basicInfo.summary}</Text>
            )}
          </View>
        )}

        {/* Education Section */}
        {resumeData.education && resumeData.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subheader}>Education</Text>
            {resumeData.education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 10 }}>
                <Text style={styles.itemTitle}>{edu.institution}</Text>
                <Text style={styles.itemSubtitle}>
                  {edu.degree} in {edu.fieldOfStudy}
                </Text>
                <Text style={styles.itemSubtitle}>
                  {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                  {edu.gpa && ` • GPA: ${edu.gpa}/${edu.gpaScale || 4.0}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Experience Section */}
        {resumeData.experience && resumeData.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subheader}>Experience</Text>
            {resumeData.experience.map((exp) => (
              <View key={exp.id} style={{ marginBottom: 10 }}>
                <Text style={styles.itemTitle}>{exp.position}</Text>
                <Text style={styles.itemSubtitle}>{exp.company}</Text>
                <Text style={styles.itemSubtitle}>
                  {exp.location} • {exp.startDate} -{' '}
                  {exp.current ? 'Present' : exp.endDate}
                </Text>
                <Text style={styles.itemDescription}>{exp.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects Section */}
        {resumeData.projects && resumeData.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subheader}>Projects</Text>
            {resumeData.projects.map((project) => (
              <View key={project.id} style={{ marginBottom: 10 }}>
                <Text style={styles.itemTitle}>{project.name}</Text>
                {project.url && (
                  <Text style={styles.itemSubtitle}>{project.url}</Text>
                )}
                <Text style={styles.itemDescription}>
                  {project.description}
                </Text>
                {project.technologies.length > 0 && (
                  <Text style={styles.itemSubtitle}>
                    Technologies: {project.technologies.join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Certifications Section */}
        {resumeData.certifications && resumeData.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subheader}>Certifications</Text>
            {resumeData.certifications.map((cert) => (
              <View key={cert.id} style={{ marginBottom: 5 }}>
                <Text style={styles.text}>
                  {cert.name} - {cert.issuer} ({cert.issueDate})
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Languages Section */}
        {resumeData.languages && resumeData.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subheader}>Languages</Text>
            <Text style={styles.text}>
              {resumeData.languages
                .map((lang) => `${lang.name} (${lang.proficiency})`)
                .join(' | ')}
            </Text>
          </View>
        )}

        {/* Volunteer Section */}
        {resumeData.volunteer && resumeData.volunteer.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subheader}>Volunteer Experience</Text>
            {resumeData.volunteer.map((vol) => (
              <View key={vol.id} style={{ marginBottom: 10 }}>
                <Text style={styles.itemTitle}>{vol.role}</Text>
                <Text style={styles.itemSubtitle}>{vol.organization}</Text>
                <Text style={styles.itemSubtitle}>
                  {vol.startDate} - {vol.current ? 'Present' : vol.endDate}
                </Text>
                <Text style={styles.itemDescription}>{vol.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Interests Section */}
        {resumeData.interests && resumeData.interests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.subheader}>Interests</Text>
            <Text style={styles.text}>{resumeData.interests.join(', ')}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}

export default AzurillTemplate
