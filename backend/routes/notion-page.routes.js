import express from 'express';
import { PrismaClient } from '@prisma/client';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(protect);

const normalizeDatabase = (database) => {
  const fallbackColumns = [
    { id: `col-${Date.now()}-1`, name: 'Name', type: 'text', options: [] },
    { id: `col-${Date.now()}-2`, name: 'Status', type: 'select', options: ['Todo', 'Doing', 'Done'] }
  ];

  if (!database || typeof database !== 'object') {
    return {
      columns: fallbackColumns,
      rows: [
        { [fallbackColumns[0].id]: '', [fallbackColumns[1].id]: 'Todo' }
      ]
    };
  }

  const columns = Array.isArray(database.columns) && database.columns.length > 0
    ? database.columns.map((column) => ({
      id: typeof column?.id === 'string' ? column.id : `col-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: typeof column?.name === 'string' ? column.name : 'Column',
      type: typeof column?.type === 'string' ? column.type : 'text',
      options: Array.isArray(column?.options) ? column.options.filter((option) => typeof option === 'string') : []
    }))
    : fallbackColumns;

  const rows = Array.isArray(database.rows)
    ? database.rows.map((row) => {
      const baseRow = {};
      columns.forEach((column) => {
        const value = row && typeof row === 'object' ? row[column.id] : '';
        baseRow[column.id] = value ?? '';
      });
      return baseRow;
    })
    : [];

  if (!rows.length) {
    const emptyRow = {};
    columns.forEach((column) => {
      emptyRow[column.id] = column.type === 'checkbox' ? false : '';
    });
    rows.push(emptyRow);
  }

  return { columns, rows };
};

const normalizeBlocks = (blocks) => {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return [{ id: `b-${Date.now()}`, type: 'paragraph', content: '' }];
  }

  return blocks.map((block) => {
    if (!block || typeof block !== 'object') {
      return { id: `b-${Date.now()}`, type: 'paragraph', content: '' };
    }

    return {
      id: typeof block.id === 'string' ? block.id : `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: typeof block.type === 'string' ? block.type : 'paragraph',
      content: typeof block.content === 'string' ? block.content : '',
      checked: typeof block.checked === 'boolean' ? block.checked : undefined,
      table: block.table && typeof block.table === 'object' ? block.table : undefined,
      database: block.database && typeof block.database === 'object' ? normalizeDatabase(block.database) : undefined
    };
  });
};

const parseBlocksJson = (blocksJson) => {
  try {
    const parsed = JSON.parse(blocksJson);
    return normalizeBlocks(parsed);
  } catch {
    return [{ id: `b-${Date.now()}`, type: 'paragraph', content: '' }];
  }
};

// GET /api/v1/notion-pages
router.get('/', async (req, res) => {
  try {
    const pages = await prisma.notionPage.findMany({
      where: { ownerId: req.user.id },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({
      success: true,
      data: pages.map((page) => ({
        id: page.id,
        title: page.title,
        icon: page.icon,
        blocks: parseBlocksJson(page.blocksJson),
        createdAt: page.createdAt,
        updatedAt: page.updatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/notion-pages/:id
router.get('/:id', async (req, res) => {
  try {
    const page = await prisma.notionPage.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user.id
      }
    });

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page non trouvée' });
    }

    res.json({
      success: true,
      data: {
        id: page.id,
        title: page.title,
        icon: page.icon,
        blocks: parseBlocksJson(page.blocksJson),
        createdAt: page.createdAt,
        updatedAt: page.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/notion-pages
router.post('/', async (req, res) => {
  try {
    const title = typeof req.body.title === 'string' && req.body.title.trim()
      ? req.body.title.trim()
      : 'Untitled';
    const icon = typeof req.body.icon === 'string' && req.body.icon.trim()
      ? req.body.icon.trim()
      : '📝';

    const blocks = normalizeBlocks(req.body.blocks);

    const page = await prisma.notionPage.create({
      data: {
        title,
        icon,
        blocksJson: JSON.stringify(blocks),
        ownerId: req.user.id
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: page.id,
        title: page.title,
        icon: page.icon,
        blocks,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/notion-pages/:id
router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.notionPage.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Page non trouvée' });
    }

    const blocks = req.body.blocks !== undefined
      ? normalizeBlocks(req.body.blocks)
      : parseBlocksJson(existing.blocksJson);

    const page = await prisma.notionPage.update({
      where: { id: req.params.id },
      data: {
        title: typeof req.body.title === 'string' ? req.body.title : existing.title,
        icon: typeof req.body.icon === 'string' ? req.body.icon : existing.icon,
        blocksJson: JSON.stringify(blocks)
      }
    });

    res.json({
      success: true,
      data: {
        id: page.id,
        title: page.title,
        icon: page.icon,
        blocks,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/notion-pages/:id
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.notionPage.findFirst({
      where: {
        id: req.params.id,
        ownerId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Page non trouvée' });
    }

    await prisma.notionPage.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: 'Page supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
