import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Obtenir tous les leads
// @route   GET /api/v1/leads
// @access  Private
export const getLeads = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status, assignedToId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (status) where.status = status;
    if (assignedToId) where.assignedToId = assignedToId;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
          customer: { select: { id: true, companyName: true } }
        }
      }),
      prisma.lead.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: leads,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    next(error);
  }
};

export const getLead = async (req, res, next) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        customer: true,
        notes: { include: { user: { select: { firstName: true, lastName: true } } } },
        activities: { include: { user: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: 'desc' }, take: 10 }
      }
    });

    if (!lead) return res.status(404).json({ success: false, message: 'Lead non trouvé' });

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (req, res, next) => {
  try {
    const lead = await prisma.lead.create({
      data: { ...req.body, assignedToId: req.body.assignedToId || req.user.id },
      include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } }
    });

    await prisma.activity.create({
      data: {
        type: 'created',
        description: `Lead "${lead.title}" créé`,
        userId: req.user.id,
        leadId: lead.id
      }
    });

    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req, res, next) => {
  try {
    const oldLead = await prisma.lead.findUnique({ where: { id: req.params.id } });
    
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: req.body,
      include: { assignedTo: { select: { id: true, firstName: true, lastName: true } } }
    });

    if (oldLead.status !== lead.status) {
      await prisma.activity.create({
        data: {
          type: 'status_changed',
          description: `Statut changé de ${oldLead.status} à ${lead.status}`,
          userId: req.user.id,
          leadId: lead.id
        }
      });
    }

    res.status(200).json({ success: true, data: lead });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    await prisma.lead.delete({ where: { id: req.params.id } });
    res.status(200).json({ success: true, message: 'Lead supprimé avec succès' });
  } catch (error) {
    next(error);
  }
};
