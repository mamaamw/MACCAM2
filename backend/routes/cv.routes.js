import express from 'express';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(protect);

// ========== EXPERIENCES ==========

// GET /api/cv/experiences - Récupérer toutes les expériences de l'utilisateur
router.get('/experiences', async (req, res) => {
  try {
    const experiences = await prisma.experience.findMany({
      where: { userId: req.user.id },
      orderBy: { startDate: 'desc' }
    });
    res.json({ success: true, data: experiences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cv/experiences - Créer une expérience
router.post('/experiences', async (req, res) => {
  try {
    const { title, company, location, employmentType, startDate, endDate, isCurrent, description, skills, achievements } = req.body;
    
    const experience = await prisma.experience.create({
      data: {
        userId: req.user.id,
        title,
        company,
        location,
        employmentType,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: isCurrent || false,
        description,
        skills: skills ? JSON.stringify(skills) : null,
        achievements: achievements ? JSON.stringify(achievements) : null
      }
    });
    
    res.status(201).json({ success: true, data: experience });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/cv/experiences/:id - Modifier une expérience
router.put('/experiences/:id', async (req, res) => {
  try {
    const { title, company, location, employmentType, startDate, endDate, isCurrent, description, skills, achievements } = req.body;
    
    const experience = await prisma.experience.update({
      where: { id: req.params.id },
      data: {
        title,
        company,
        location,
        employmentType,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        isCurrent,
        description,
        skills: skills ? JSON.stringify(skills) : null,
        achievements: achievements ? JSON.stringify(achievements) : null
      }
    });
    
    res.json({ success: true, data: experience });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cv/experiences/:id - Supprimer une expérience
router.delete('/experiences/:id', async (req, res) => {
  try {
    await prisma.experience.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Expérience supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== EDUCATION ==========

// GET /api/cv/education - Récupérer toutes les formations académiques
router.get('/education', async (req, res) => {
  try {
    const education = await prisma.education.findMany({
      where: { userId: req.user.id },
      orderBy: { startDate: 'desc' }
    });
    res.json({ success: true, data: education });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cv/education - Créer une formation académique
router.post('/education', async (req, res) => {
  try {
    const { degree, fieldOfStudy, school, location, startDate, endDate, isCurrent, grade, description, activities } = req.body;
    
    const education = await prisma.education.create({
      data: {
        userId: req.user.id,
        degree,
        fieldOfStudy,
        school,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: isCurrent || false,
        grade,
        description,
        activities: activities ? JSON.stringify(activities) : null
      }
    });
    
    res.status(201).json({ success: true, data: education });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/cv/education/:id - Modifier une formation académique
router.put('/education/:id', async (req, res) => {
  try {
    const { degree, fieldOfStudy, school, location, startDate, endDate, isCurrent, grade, description, activities } = req.body;
    
    const education = await prisma.education.update({
      where: { id: req.params.id },
      data: {
        degree,
        fieldOfStudy,
        school,
        location,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        isCurrent,
        grade,
        description,
        activities: activities ? JSON.stringify(activities) : null
      }
    });
    
    res.json({ success: true, data: education });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cv/education/:id - Supprimer une formation académique
router.delete('/education/:id', async (req, res) => {
  try {
    await prisma.education.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Formation supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== TRAININGS ==========

// GET /api/cv/trainings - Récupérer toutes les formations/cours
router.get('/trainings', async (req, res) => {
  try {
    const trainings = await prisma.training.findMany({
      where: { userId: req.user.id },
      orderBy: { completionDate: 'desc' }
    });
    res.json({ success: true, data: trainings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cv/trainings - Créer une formation/cours
router.post('/trainings', async (req, res) => {
  try {
    const { name, organization, instructor, duration, completionDate, skills, description, url } = req.body;
    
    const training = await prisma.training.create({
      data: {
        userId: req.user.id,
        name,
        organization,
        instructor,
        duration,
        completionDate: completionDate ? new Date(completionDate) : null,
        skills: skills ? JSON.stringify(skills) : null,
        description,
        url
      }
    });
    
    res.status(201).json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/cv/trainings/:id - Modifier une formation/cours
router.put('/trainings/:id', async (req, res) => {
  try {
    const { name, organization, instructor, duration, completionDate, skills, description, url } = req.body;
    
    const training = await prisma.training.update({
      where: { id: req.params.id },
      data: {
        name,
        organization,
        instructor,
        duration,
        completionDate: completionDate ? new Date(completionDate) : null,
        skills: skills ? JSON.stringify(skills) : null,
        description,
        url
      }
    });
    
    res.json({ success: true, data: training });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cv/trainings/:id - Supprimer une formation/cours
router.delete('/trainings/:id', async (req, res) => {
  try {
    await prisma.training.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Formation supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== CERTIFICATES ==========

// GET /api/cv/certificates - Récupérer tous les certificats
router.get('/certificates', async (req, res) => {
  try {
    const certificates = await prisma.certificate.findMany({
      where: { userId: req.user.id },
      orderBy: { issueDate: 'desc' }
    });
    res.json({ success: true, data: certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cv/certificates - Créer un certificat
router.post('/certificates', async (req, res) => {
  try {
    const { name, issuingOrg, issueDate, expiryDate, credentialId, credentialUrl, skills, description, fileUrl } = req.body;
    
    const certificate = await prisma.certificate.create({
      data: {
        userId: req.user.id,
        name,
        issuingOrg,
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialId,
        credentialUrl,
        skills: skills ? JSON.stringify(skills) : null,
        description,
        fileUrl
      }
    });
    
    res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/cv/certificates/:id - Modifier un certificat
router.put('/certificates/:id', async (req, res) => {
  try {
    const { name, issuingOrg, issueDate, expiryDate, credentialId, credentialUrl, skills, description, fileUrl } = req.body;
    
    const certificate = await prisma.certificate.update({
      where: { id: req.params.id },
      data: {
        name,
        issuingOrg,
        issueDate: issueDate ? new Date(issueDate) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialId,
        credentialUrl,
        skills: skills ? JSON.stringify(skills) : null,
        description,
        fileUrl
      }
    });
    
    res.json({ success: true, data: certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cv/certificates/:id - Supprimer un certificat
router.delete('/certificates/:id', async (req, res) => {
  try {
    await prisma.certificate.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Certificat supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== VOLUNTEERS ==========

// GET /api/cv/volunteers - Récupérer tous les engagements bénévoles
router.get('/volunteers', async (req, res) => {
  try {
    const volunteers = await prisma.volunteer.findMany({
      where: { userId: req.user.id },
      orderBy: { startDate: 'desc' }
    });
    res.json({ success: true, data: volunteers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cv/volunteers - Créer un engagement bénévole
router.post('/volunteers', async (req, res) => {
  try {
    const { role, organization, cause, location, startDate, endDate, isCurrent, description } = req.body;
    
    const volunteer = await prisma.volunteer.create({
      data: {
        userId: req.user.id,
        role,
        organization,
        cause,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: isCurrent || false,
        description
      }
    });
    
    res.status(201).json({ success: true, data: volunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/cv/volunteers/:id - Modifier un engagement bénévole
router.put('/volunteers/:id', async (req, res) => {
  try {
    const { role, organization, cause, location, startDate, endDate, isCurrent, description } = req.body;
    
    const volunteer = await prisma.volunteer.update({
      where: { id: req.params.id },
      data: {
        role,
        organization,
        cause,
        location,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        isCurrent,
        description
      }
    });
    
    res.json({ success: true, data: volunteer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cv/volunteers/:id - Supprimer un engagement bénévole
router.delete('/volunteers/:id', async (req, res) => {
  try {
    await prisma.volunteer.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Engagement bénévole supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== PROJECTS ==========

// GET /api/cv/projects - Récupérer tous les projets
router.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.cvProject.findMany({
      where: { userId: req.user.id },
      orderBy: { startDate: 'desc' }
    });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cv/projects - Créer un projet
router.post('/projects', async (req, res) => {
  try {
    const { name, role, description, startDate, endDate, isCurrent, url, technologies, achievements, collaborators } = req.body;
    
    const project = await prisma.cvProject.create({
      data: {
        userId: req.user.id,
        name,
        role,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isCurrent: isCurrent || false,
        url,
        technologies: technologies ? JSON.stringify(technologies) : null,
        achievements: achievements ? JSON.stringify(achievements) : null,
        collaborators: collaborators ? JSON.stringify(collaborators) : null
      }
    });
    
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/cv/projects/:id - Modifier un projet
router.put('/projects/:id', async (req, res) => {
  try {
    const { name, role, description, startDate, endDate, isCurrent, url, technologies, achievements, collaborators } = req.body;
    
    const project = await prisma.cvProject.update({
      where: { id: req.params.id },
      data: {
        name,
        role,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        isCurrent,
        url,
        technologies: technologies ? JSON.stringify(technologies) : null,
        achievements: achievements ? JSON.stringify(achievements) : null,
        collaborators: collaborators ? JSON.stringify(collaborators) : null
      }
    });
    
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cv/projects/:id - Supprimer un projet
router.delete('/projects/:id', async (req, res) => {
  try {
    await prisma.cvProject.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Projet supprimé' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== SKILLS ==========

// GET /api/cv/skills - Récupérer toutes les compétences
router.get('/skills', async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      where: { userId: req.user.id },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });
    res.json({ success: true, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/cv/skills - Créer une compétence
router.post('/skills', async (req, res) => {
  try {
    const { name, category, level, yearsOfExp, endorsements, description } = req.body;
    
    const skill = await prisma.skill.create({
      data: {
        userId: req.user.id,
        name,
        category,
        level,
        yearsOfExp: yearsOfExp ? parseInt(yearsOfExp) : null,
        endorsements: endorsements ? parseInt(endorsements) : 0,
        description
      }
    });
    
    res.status(201).json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/cv/skills/:id - Modifier une compétence
router.put('/skills/:id', async (req, res) => {
  try {
    const { name, category, level, yearsOfExp, endorsements, description } = req.body;
    
    const skill = await prisma.skill.update({
      where: { id: req.params.id },
      data: {
        name,
        category,
        level,
        yearsOfExp: yearsOfExp ? parseInt(yearsOfExp) : null,
        endorsements: endorsements ? parseInt(endorsements) : undefined,
        description
      }
    });
    
    res.json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/cv/skills/:id - Supprimer une compétence
router.delete('/skills/:id', async (req, res) => {
  try {
    await prisma.skill.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true, message: 'Compétence supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========== SUMMARY ==========

// GET /api/cv/summary - Récupérer le résumé complet du CV
router.get('/summary', async (req, res) => {
  try {
    const [experiences, education, trainings, certificates, volunteers, projects, skills] = await Promise.all([
      prisma.experience.findMany({ where: { userId: req.user.id }, orderBy: { startDate: 'desc' } }),
      prisma.education.findMany({ where: { userId: req.user.id }, orderBy: { startDate: 'desc' } }),
      prisma.training.findMany({ where: { userId: req.user.id }, orderBy: { completionDate: 'desc' } }),
      prisma.certificate.findMany({ where: { userId: req.user.id }, orderBy: { issueDate: 'desc' } }),
      prisma.volunteer.findMany({ where: { userId: req.user.id }, orderBy: { startDate: 'desc' } }),
      prisma.cvProject.findMany({ where: { userId: req.user.id }, orderBy: { startDate: 'desc' } }),
      prisma.skill.findMany({ where: { userId: req.user.id }, orderBy: [{ category: 'asc' }, { name: 'asc' }] })
    ]);
    
    res.json({
      success: true,
      data: {
        experiences,
        education,
        trainings,
        certificates,
        volunteers,
        projects,
        skills
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
