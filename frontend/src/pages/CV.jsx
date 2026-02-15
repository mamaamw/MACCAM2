import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

export default function CV() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  
  const [cvData, setCvData] = useState({
    // En-tête
    fullName: user?.firstName + ' ' + user?.lastName || '',
    headline: 'Développeur Full Stack | React | Node.js',
    location: 'Paris, France',
    profileImage: '/assets/images/avatar/1.png',
    bannerImage: '/assets/images/banner/1.jpg',
    
    // À propos
    about: `Passionné de technologie avec plus de 5 ans d'expérience dans le développement web. 
Spécialisé en React, Node.js et architectures cloud. 
Je cherche constamment à apprendre de nouvelles technologies et à résoudre des problèmes complexes.`,
    
    // Contact
    email: user?.email || '',
    phone: '+33 6 12 34 56 78',
    website: 'https://mon-portfolio.com',
    linkedin: 'https://linkedin.com/in/macareux',
    github: 'https://github.com/username',
    
    // Expériences
    experiences: [
      {
        id: 1,
        title: 'Développeur Full Stack Senior',
        company: 'Tech Company',
        location: 'Paris, France',
        type: 'CDI',
        startDate: '2021-01',
        endDate: null,
        current: true,
        description: `• Développement d'applications web avec React et Node.js
• Architecture et conception de microservices
• Mentorat des développeurs juniors
• Optimisation des performances et de l'expérience utilisateur`
      },
      {
        id: 2,
        title: 'Développeur Full Stack',
        company: 'StartUp Innovante',
        location: 'Lyon, France',
        type: 'CDI',
        startDate: '2019-03',
        endDate: '2020-12',
        current: false,
        description: `• Création de MVP pour validation de marché
• Intégration d'APIs RESTful et GraphQL
• Déploiement sur AWS et gestion DevOps
• Collaboration étroite avec l'équipe produit`
      }
    ],
    
    // Formation
    education: [
      {
        id: 1,
        degree: 'Master en Informatique',
        school: 'École d\'Ingénieurs',
        location: 'Paris, France',
        startDate: '2015-09',
        endDate: '2018-06',
        description: 'Spécialisation en développement logiciel et intelligence artificielle'
      },
      {
        id: 2,
        degree: 'Licence Informatique',
        school: 'Université Paris-Saclay',
        location: 'Orsay, France',
        startDate: '2012-09',
        endDate: '2015-06',
        description: 'Formation générale en informatique et mathématiques'
      }
    ],
    
    // Compétences
    skills: [
      { category: 'Frontend', items: ['React', 'Vue.js', 'TypeScript', 'Tailwind CSS', 'Bootstrap'] },
      { category: 'Backend', items: ['Node.js', 'Express', 'NestJS', 'Python', 'Django'] },
      { category: 'Database', items: ['PostgreSQL', 'MongoDB', 'Redis', 'Prisma'] },
      { category: 'DevOps', items: ['Docker', 'AWS', 'CI/CD', 'GitHub Actions'] },
      { category: 'Outils', items: ['Git', 'VS Code', 'Figma', 'Jira', 'Slack'] }
    ],
    
    // Langues
    languages: [
      { name: 'Français', level: 'Natif' },
      { name: 'Anglais', level: 'Courant (C1)' },
      { name: 'Espagnol', level: 'Intermédiaire (B1)' }
    ],
    
    // Certifications
    certifications: [
      {
        id: 1,
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2023-05',
        credentialId: 'AWS-12345'
      },
      {
        id: 2,
        name: 'Professional Scrum Master I',
        issuer: 'Scrum.org',
        date: '2022-11',
        credentialId: 'PSM-67890'
      }
    ],
    
    // Projets
    projects: [
      {
        id: 1,
        name: 'MACCAM CRM',
        description: 'Plateforme CRM complète avec gestion clients, projets et facturation',
        technologies: ['React', 'Node.js', 'Prisma', 'SQLite'],
        url: 'https://github.com/username/maccam',
        image: '/assets/images/gallery/1.jpg'
      },
      {
        id: 2,
        name: 'E-commerce Platform',
        description: 'Solution e-commerce avec paiement Stripe et gestion des stocks',
        technologies: ['Next.js', 'PostgreSQL', 'Stripe', 'Tailwind'],
        url: 'https://github.com/username/ecommerce',
        image: '/assets/images/gallery/2.jpg'
      }
    ],
    
    // Recommandations
    recommendations: [
      {
        id: 1,
        author: 'Jean Dupont',
        position: 'CTO chez Tech Company',
        avatar: '/assets/images/avatar/2.png',
        date: '2024-01',
        content: `J'ai eu le plaisir de travailler avec [Nom] pendant 2 ans. 
C'est un développeur exceptionnel avec une grande capacité d'apprentissage. 
Son expertise technique et son esprit d'équipe sont remarquables.`
      }
    ]
  })

  // Charger les données depuis localStorage
  useEffect(() => {
    const savedExperiences = localStorage.getItem('cv_experiences')
    const savedEducation = localStorage.getItem('cv_education')
    const savedSkills = localStorage.getItem('cv_skills')
    
    if (savedExperiences || savedEducation || savedSkills) {
      setCvData(prev => ({
        ...prev,
        experiences: savedExperiences ? JSON.parse(savedExperiences) : prev.experiences,
        education: savedEducation ? JSON.parse(savedEducation) : prev.education,
        skills: savedSkills ? JSON.parse(savedSkills) : prev.skills
      }))
    }
  }, [])

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Présent'
    const [year, month] = dateStr.split('-')
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
    return `${months[parseInt(month) - 1]} ${year}`
  }

  const calculateDuration = (start, end) => {
    const startDate = new Date(start)
    const endDate = end ? new Date(end) : new Date()
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                   (endDate.getMonth() - startDate.getMonth())
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    
    if (years === 0) return `${remainingMonths} mois`
    if (remainingMonths === 0) return `${years} an${years > 1 ? 's' : ''}`
    return `${years} an${years > 1 ? 's' : ''} ${remainingMonths} mois`
  }

  const handleExportPDF = () => {
    toast.success('Export PDF en cours...')
    // TODO: Implémenter l'export PDF
  }

  return (
    <div className="main-content">
      {/* Actions Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Mon CV Professionnel</h4>
        <button 
          className="btn btn-primary"
          onClick={handleExportPDF}
        >
          <i className="feather-download me-2"></i>
          Export PDF
        </button>
      </div>

      {/* Bannière et Photo de Profil */}
      <div className="card mb-4">
        <div className="position-relative">
          <img 
            src={cvData.bannerImage} 
            alt="Bannière"
            className="w-100"
            style={{ height: '200px', objectFit: 'cover' }}
          />
        </div>
        <div className="card-body">
          <div className="d-flex align-items-start gap-4" style={{ marginTop: '-80px' }}>
            <div className="position-relative">
              <img 
                src={cvData.profileImage}
                alt="Profile"
                className="rounded-circle border border-4 border-white"
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              />
            </div>
            <div className="flex-grow-1 mt-5">
              <h3 className="mb-1">{cvData.fullName}</h3>
              <p className="text-muted mb-2">{cvData.headline}</p>
              <p className="text-muted mb-0">
                <i className="feather-map-pin me-2"></i>
                {cvData.location}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Colonne Principale */}
        <div className="col-lg-8">
          {/* À propos */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">À propos</h5>
            </div>
            <div className="card-body">
              <p className="mb-0" style={{ whiteSpace: 'pre-line' }}>{cvData.about}</p>
            </div>
          </div>

          {/* Expériences */}
          <div className="card mb-4">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <h5 className="card-title mb-0">Expérience professionnelle</h5>
                  <button className="btn btn-sm btn-icon btn-light" onClick={() => navigate('/cv/edit-experiences')} title="Modifier">
                    <i className="feather-plus"></i>
                  </button>
                </div>
                <button className="btn btn-sm btn-light" onClick={() => navigate('/cv/edit-experiences')}>
                  <i className="feather-edit-2 me-1"></i>
                  Modifier
                </button>
              </div>
            </div>
            <div className="card-body">
              {cvData.experiences.map((exp, index) => (
                <div key={exp.id} className={index < cvData.experiences.length - 1 ? 'mb-4 pb-4 border-bottom' : 'mb-0'}>
                  <div className="d-flex gap-3">
                    <div className="avatar-text bg-primary text-white">
                      <i className="feather-briefcase"></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{exp.title}</h6>
                      <p className="mb-1">
                        <strong>{exp.company}</strong> · {exp.type}
                      </p>
                      <p className="text-muted mb-2" style={{ fontSize: '0.875rem' }}>
                        {formatDate(exp.startDate)} - {exp.current ? 'Présent' : formatDate(exp.endDate)} · {calculateDuration(exp.startDate, exp.endDate)}
                      </p>
                      <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                        <i className="feather-map-pin me-1"></i>
                        {exp.location}
                      </p>
                      <p className="mt-2 mb-0" style={{ whiteSpace: 'pre-line', fontSize: '0.875rem' }}>
                        {exp.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formation */}
          <div className="card mb-4">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <h5 className="card-title mb-0">Formation</h5>
                  <button className="btn btn-sm btn-icon btn-light" onClick={() => navigate('/cv/edit-education')} title="Modifier">
                    <i className="feather-plus"></i>
                  </button>
                </div>
                <button className="btn btn-sm btn-light" onClick={() => navigate('/cv/edit-education')}>
                  <i className="feather-edit-2 me-1"></i>
                  Modifier
                </button>
              </div>
            </div>
            <div className="card-body">
              {cvData.education.map((edu, index) => (
                <div key={edu.id} className={index < cvData.education.length - 1 ? 'mb-4 pb-4 border-bottom' : 'mb-0'}>
                  <div className="d-flex gap-3">
                    <div className="avatar-text bg-success text-white">
                      <i className="feather-book"></i>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{edu.degree}</h6>
                      <p className="mb-1"><strong>{edu.school}</strong></p>
                      <p className="text-muted mb-2" style={{ fontSize: '0.875rem' }}>
                        {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </p>
                      <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                        <i className="feather-map-pin me-1"></i>
                        {edu.location}
                      </p>
                      {edu.description && (
                        <p className="mt-2 mb-0" style={{ fontSize: '0.875rem' }}>
                          {edu.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projets */}
          <div className="card mb-4">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <h5 className="card-title mb-0">Projets</h5>
                  <button className="btn btn-sm btn-icon btn-light" onClick={() => navigate('/cv/edit-projects')} title="Modifier">
                    <i className="feather-plus"></i>
                  </button>
                </div>
                <button className="btn btn-sm btn-light" onClick={() => navigate('/cv/edit-projects')}>
                  <i className="feather-edit-2 me-1"></i>
                  Modifier
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                {cvData.projects.map((project) => (
                  <div key={project.id} className="col-md-6 mb-3">
                    <div className="card h-100">
                      <img 
                        src={project.image} 
                        className="card-img-top"
                        alt={project.name}
                        style={{ height: '150px', objectFit: 'cover' }}
                      />
                      <div className="card-body">
                        <h6 className="card-title mb-2">{project.name}</h6>
                        <p className="card-text" style={{ fontSize: '0.875rem' }}>
                          {project.description}
                        </p>
                        <div className="d-flex flex-wrap gap-1 mb-2">
                          {project.technologies.map((tech, i) => (
                            <span key={i} className="badge bg-soft-primary text-primary">
                              {tech}
                            </span>
                          ))}
                        </div>
                        {project.url && (
                          <a href={project.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-light">
                            <i className="feather-external-link me-1"></i>
                            Voir le projet
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommandations */}
          <div className="card mb-4">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <h5 className="card-title mb-0">Recommandations</h5>
                  <button className="btn btn-sm btn-icon btn-light" onClick={() => toast.info('Fonctionnalité à venir')} title="Modifier">
                    <i className="feather-plus"></i>
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              {cvData.recommendations.map((rec) => (
                <div key={rec.id} className="mb-3">
                  <div className="d-flex gap-3">
                    <img 
                      src={rec.avatar}
                      alt={rec.author}
                      className="rounded-circle"
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                    <div className="flex-grow-1">
                      <h6 className="mb-0">{rec.author}</h6>
                      <p className="text-muted mb-2" style={{ fontSize: '0.875rem' }}>
                        {rec.position}
                      </p>
                      <p className="mb-0" style={{ fontSize: '0.875rem', fontStyle: 'italic' }}>
                        "{rec.content}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Droite */}
        <div className="col-lg-4">
          {/* Contact */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Contact</h5>
            </div>
            <div className="card-body">
              <div className="d-flex flex-column gap-3">
                <div>
                  <i className="feather-mail text-primary me-2"></i>
                  <a href={`mailto:${cvData.email}`}>{cvData.email}</a>
                </div>
                <div>
                  <i className="feather-phone text-primary me-2"></i>
                  <span>{cvData.phone}</span>
                </div>
                <div>
                  <i className="feather-globe text-primary me-2"></i>
                  <a href={cvData.website} target="_blank" rel="noopener noreferrer">
                    Portfolio
                  </a>
                </div>
                <div>
                  <i className="feather-linkedin text-primary me-2"></i>
                  <a href={cvData.linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </div>
                <div>
                  <i className="feather-github text-primary me-2"></i>
                  <a href={cvData.github} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Compétences */}
          <div className="card mb-4">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <h5 className="card-title mb-0">Compétences</h5>
                  <button className="btn btn-sm btn-icon btn-light" onClick={() => navigate('/cv/edit-skills')} title="Modifier">
                    <i className="feather-plus"></i>
                  </button>
                </div>
                <button className="btn btn-sm btn-light" onClick={() => navigate('/cv/edit-skills')}>
                  <i className="feather-edit-2 me-1"></i>
                  Modifier
                </button>
              </div>
            </div>
            <div className="card-body">
              {cvData.skills.map((skillGroup, index) => (
                <div key={index} className={index < cvData.skills.length - 1 ? 'mb-3' : ''}>
                  <h6 className="mb-2">{skillGroup.category}</h6>
                  <div className="d-flex flex-wrap gap-1">
                    {skillGroup.items.map((skill, i) => (
                      <span key={i} className="badge bg-soft-secondary text-secondary">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Langues */}
          <div className="card mb-4">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <h5 className="card-title mb-0">Langues</h5>
                  <button className="btn btn-sm btn-icon btn-light" onClick={() => toast.info('Cliquez sur Modifier')} title="Ajouter">
                    <i className="feather-plus"></i>
                  </button>
                </div>
                <button className="btn btn-sm btn-light" onClick={() => navigate('/cv/edit-languages')}>
                  <i className="feather-edit-2 me-1"></i>
                  Modifier
                </button>
              </div>
            </div>
            <div className="card-body">
              {cvData.languages.map((lang, index) => (
                <div key={index} className={index < cvData.languages.length - 1 ? 'mb-2' : ''}>
                  <div className="d-flex justify-content-between">
                    <span>{lang.name}</span>
                    <span className="text-muted">{lang.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="card mb-4">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <h5 className="card-title mb-0">Certifications</h5>
                  <button className="btn btn-sm btn-icon btn-light" onClick={() => navigate('/cv/edit-certifications')} title="Modifier">
                    <i className="feather-plus"></i>
                  </button>
                </div>
                <button className="btn btn-sm btn-light" onClick={() => navigate('/cv/edit-certifications')}>
                  <i className="feather-edit-2 me-1"></i>
                  Modifier
                </button>
              </div>
            </div>
            <div className="card-body">
              {cvData.certifications.map((cert, index) => (
                <div key={cert.id} className={index < cvData.certifications.length - 1 ? 'mb-3 pb-3 border-bottom' : ''}>
                  <h6 className="mb-1" style={{ fontSize: '0.875rem' }}>{cert.name}</h6>
                  <p className="text-muted mb-1" style={{ fontSize: '0.75rem' }}>
                    {cert.issuer}
                  </p>
                  <p className="text-muted mb-0" style={{ fontSize: '0.75rem' }}>
                    Délivré en {formatDate(cert.date)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
