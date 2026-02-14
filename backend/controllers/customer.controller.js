import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Obtenir tous les clients
// @route   GET /api/v1/customers
// @access  Private
export const getCustomers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              projects: true,
              invoices: true
            }
          }
        }
      }),
      prisma.customer.count({ where })
    ]);

    res.status(200).json({
      success: true,
      data: customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir un client
// @route   GET /api/v1/customers/:id
// @access  Private
export const getCustomer = async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        projects: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        },
        invoices: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Créer un client
// @route   POST /api/v1/customers
// @access  Private
export const createCustomer = async (req, res, next) => {
  try {
    const customer = await prisma.customer.create({
      data: req.body
    });

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour un client
// @route   PUT /api/v1/customers/:id
// @access  Private
export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer un client
// @route   DELETE /api/v1/customers/:id
// @access  Private (Admin/Manager only)
export const deleteCustomer = async (req, res, next) => {
  try {
    await prisma.customer.delete({
      where: { id: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Client supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};
