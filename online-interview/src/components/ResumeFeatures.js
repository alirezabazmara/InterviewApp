import React from 'react';
import './ResumeFeatures.css';

const ResumeFeatures = ({ features }) => {
  if (!features) return null;

  return (
    <div className="resume-features">
      <h3>Resume Features</h3>
      
      {/* Skills */}
      {features.skills && features.skills.length > 0 && (
        <div className="feature-section">
          <h4>Skills</h4>
          <div className="skills-container">
            {features.skills.map((skill, index) => (
              <span key={index} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {features.experience && features.experience.length > 0 && (
        <div className="feature-section">
          <h4>Experience</h4>
          {features.experience.map((exp, index) => (
            <div key={index} className="experience-item">
              <h5>{exp.title}</h5>
              <p>{exp.duration}</p>
              <div className="technologies">
                {exp.technologies.map((tech, i) => (
                  <span key={i} className="tech-tag">{tech}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {features.education && features.education.length > 0 && (
        <div className="feature-section">
          <h4>Education</h4>
          {features.education.map((edu, index) => (
            <div key={index} className="education-item">
              <p>{edu}</p>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {features.certifications && features.certifications.length > 0 && (
        <div className="feature-section">
          <h4>Certifications</h4>
          {features.certifications.map((cert, index) => (
            <div key={index} className="certification-item">
              <p>{cert}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResumeFeatures;
