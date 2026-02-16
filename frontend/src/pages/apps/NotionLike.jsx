import { useEffect, useMemo, useRef, useState } from 'react'
import notionPageService from '../../services/notionPageService'

const DEFAULT_PAGES = [
  {
    id: 'page-1',
    icon: '📄',
    title: 'Notes produit',
    blocks: [
      { id: 'b-1', type: 'h1', content: 'Roadmap Q1' },
      { id: 'b-2', type: 'paragraph', content: 'Objectifs du trimestre, priorités et planning de livraison.' },
      { id: 'b-3', type: 'todo', content: 'Préparer la démo client', checked: false }
    ]
  }
]

const BLOCK_TYPES = [
  { key: 'paragraph', label: 'Text', icon: 'feather-type' },
  { key: 'h1', label: 'Heading 1', icon: 'feather-hash' },
  { key: 'h2', label: 'Heading 2', icon: 'feather-hash' },
  { key: 'h3', label: 'Heading 3', icon: 'feather-hash' },
  { key: 'todo', label: 'To-do list', icon: 'feather-check-square' },
  { key: 'bulleted', label: 'Bulleted list', icon: 'feather-list' },
  { key: 'numbered', label: 'Numbered list', icon: 'feather-list' },
  { key: 'quote', label: 'Quote', icon: 'feather-message-square' },
  { key: 'code', label: 'Code', icon: 'feather-code' },
  { key: 'database', label: 'Database', icon: 'feather-database' },
  { key: 'table', label: 'Table', icon: 'feather-grid' },
  { key: 'divider', label: 'Divider', icon: 'feather-minus' }
]

const STORAGE_ACTIVE_PAGE_KEY = 'notion_like_active_page_v2'
const STORAGE_FALLBACK_PAGES_KEY = 'notion_like_pages_fallback_v2'

function createDefaultTable() {
  return {
    columns: ['Column 1', 'Column 2'],
    rows: [
      ['', ''],
      ['', '']
    ]
  }
}

function createDefaultDatabase() {
  const titleColumnId = `col-${Date.now()}-title`
  const statusColumnId = `col-${Date.now()}-status`

  return {
    columns: [
      { id: titleColumnId, name: 'Name', type: 'text', options: [] },
      { id: statusColumnId, name: 'Status', type: 'select', options: ['Todo', 'Doing', 'Done'] }
    ],
    rows: [
      { [titleColumnId]: '', [statusColumnId]: 'Todo' }
    ]
  }
}

function createBlock(type = 'paragraph', presetContent = '') {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const defaults = {
    paragraph: 'Type \'/\' for commands',
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
    todo: 'To-do item',
    bulleted: 'List item',
    numbered: 'List item',
    quote: 'Quote',
    code: 'const idea = true;'
  }

  if (type === 'divider') {
    return { id: `b-${uid}`, type: 'divider', content: '' }
  }

  if (type === 'table') {
    return { id: `b-${uid}`, type: 'table', content: '', table: createDefaultTable() }
  }

  if (type === 'database') {
    return { id: `b-${uid}`, type: 'database', content: '', database: createDefaultDatabase() }
  }

  return {
    id: `b-${uid}`,
    type,
    content: presetContent || defaults[type] || 'Type something',
    checked: type === 'todo' ? false : undefined
  }
}

function normalizeDatabaseShape(database) {
  const fallback = createDefaultDatabase()
  if (!database || typeof database !== 'object') return fallback

  const allowedTypes = ['text', 'select', 'date', 'checkbox', 'number']

  const columns = Array.isArray(database.columns) && database.columns.length > 0
    ? database.columns.map((column, index) => {
      const type = typeof column?.type === 'string' && allowedTypes.includes(column.type) ? column.type : 'text'
      return {
        id: typeof column?.id === 'string' ? column.id : `col-${Date.now()}-${index}`,
        name: typeof column?.name === 'string' && column.name.trim() ? column.name : 'Column',
        type,
        options: type === 'select'
          ? (Array.isArray(column?.options) && column.options.length > 0
            ? column.options.filter(option => typeof option === 'string' && option.trim())
            : ['Option 1', 'Option 2'])
          : []
      }
    })
    : fallback.columns

  const rows = Array.isArray(database.rows)
    ? database.rows.map(row => {
      const result = {}
      columns.forEach(column => {
        const value = row && typeof row === 'object' ? row[column.id] : ''
        if (column.type === 'checkbox') {
          result[column.id] = Boolean(value)
        } else if (column.type === 'number') {
          result[column.id] = value === '' || value === null || value === undefined ? '' : Number(value)
        } else {
          result[column.id] = typeof value === 'string' ? value : ''
        }
      })
      return result
    })
    : []

  if (!rows.length) {
    const emptyRow = {}
    columns.forEach(column => {
      emptyRow[column.id] = column.type === 'checkbox' ? false : ''
    })
    rows.push(emptyRow)
  }

  return { columns, rows }
}

function normalizeTableShape(table) {
  const fallback = createDefaultTable()
  if (!table || typeof table !== 'object') return fallback

  const columns = Array.isArray(table.columns) && table.columns.length > 0
    ? table.columns.map(col => (typeof col === 'string' ? col : ''))
    : fallback.columns

  const rows = Array.isArray(table.rows) && table.rows.length > 0
    ? table.rows.map(row => {
      if (!Array.isArray(row)) return columns.map(() => '')
      const padded = [...row]
      while (padded.length < columns.length) padded.push('')
      return padded.slice(0, columns.length).map(cell => (typeof cell === 'string' ? cell : ''))
    })
    : fallback.rows

  return { columns, rows }
}

function normalizeBlock(block) {
  if (!block || typeof block !== 'object') return createBlock('paragraph', '')
  if (block.type === 'database') {
    return {
      id: typeof block.id === 'string' ? block.id : createBlock('database').id,
      type: 'database',
      content: '',
      database: normalizeDatabaseShape(block.database)
    }
  }

  if (block.type === 'table') {
    return {
      id: typeof block.id === 'string' ? block.id : createBlock('table').id,
      type: 'table',
      content: '',
      table: normalizeTableShape(block.table)
    }
  }
  if (block.type === 'divider') {
    return {
      id: typeof block.id === 'string' ? block.id : createBlock('divider').id,
      type: 'divider',
      content: ''
    }
  }

  return {
    id: typeof block.id === 'string' ? block.id : createBlock('paragraph').id,
    type: typeof block.type === 'string' ? block.type : 'paragraph',
    content: typeof block.content === 'string' ? block.content : '',
    checked: typeof block.checked === 'boolean' ? block.checked : undefined
  }
}

function normalizePage(page) {
  return {
    id: page.id,
    icon: typeof page.icon === 'string' && page.icon ? page.icon : '📝',
    title: typeof page.title === 'string' ? page.title : 'Untitled',
    blocks: Array.isArray(page.blocks) && page.blocks.length > 0
      ? page.blocks.map(normalizeBlock)
      : [createBlock('paragraph', '')]
  }
}

function blockStyle(type) {
  if (type === 'h1') return 'fs-1 fw-bold'
  if (type === 'h2') return 'fs-2 fw-bold'
  if (type === 'h3') return 'fs-4 fw-semibold'
  if (type === 'quote') return 'fst-italic'
  if (type === 'code') return 'font-monospace bg-light rounded-2 p-2'
  return ''
}

function nextBlockTypeFromEnter(currentType, content) {
  const trimmed = content.trim()

  if ((currentType === 'bulleted' || currentType === 'numbered' || currentType === 'todo') && !trimmed) {
    return 'paragraph'
  }

  if (currentType === 'h1' || currentType === 'h2' || currentType === 'h3' || currentType === 'quote' || currentType === 'code' || currentType === 'divider' || currentType === 'table' || currentType === 'database') {
    return 'paragraph'
  }

  return currentType
}

function isTextBlock(type) {
  return type !== 'divider' && type !== 'table' && type !== 'database'
}

function reorderBlocks(blocks, sourceId, targetId) {
  if (!sourceId || !targetId || sourceId === targetId) return blocks
  const sourceIndex = blocks.findIndex(block => block.id === sourceId)
  const targetIndex = blocks.findIndex(block => block.id === targetId)
  if (sourceIndex < 0 || targetIndex < 0) return blocks

  const next = [...blocks]
  const [moved] = next.splice(sourceIndex, 1)
  next.splice(targetIndex, 0, moved)
  return next
}

export default function NotionLike() {
  const [pages, setPages] = useState(DEFAULT_PAGES)
  const [activePageId, setActivePageId] = useState('')
  const [pageSearch, setPageSearch] = useState('')
  const [slashState, setSlashState] = useState({ visible: false, blockId: '', query: '' })
  const [draggedBlockId, setDraggedBlockId] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isBackendConnected, setIsBackendConnected] = useState(false)
  const [saveState, setSaveState] = useState('saved')

  const blockRefs = useRef({})
  const saveQueueRef = useRef(new Map())
  const saveTimerRef = useRef(null)

  const activePage = useMemo(
    () => pages.find(page => page.id === activePageId) || pages[0],
    [pages, activePageId]
  )

  const filteredPages = useMemo(() => {
    const query = pageSearch.trim().toLowerCase()
    if (!query) return pages
    return pages.filter(page => page.title.toLowerCase().includes(query))
  }, [pages, pageSearch])

  const slashOptions = useMemo(() => {
    if (!slashState.visible) return []
    const query = slashState.query.trim().toLowerCase()
    if (!query) return BLOCK_TYPES
    return BLOCK_TYPES.filter(item => item.label.toLowerCase().includes(query))
  }, [slashState])

  const flushSaveQueue = async () => {
    if (!isBackendConnected) return
    const queue = Array.from(saveQueueRef.current.values())
    if (!queue.length) return

    saveQueueRef.current.clear()
    setSaveState('saving')

    try {
      await Promise.all(queue.map(page => notionPageService.update(page.id, {
        title: page.title,
        icon: page.icon,
        blocks: page.blocks
      })))
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }

  const schedulePageSave = (page) => {
    if (!isBackendConnected) return
    saveQueueRef.current.set(page.id, page)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      flushSaveQueue()
    }, 650)
  }

  useEffect(() => {
    let mounted = true

    const loadPages = async () => {
      try {
        const response = await notionPageService.getAll()
        const data = Array.isArray(response?.data) ? response.data.map(normalizePage) : []

        if (!mounted) return

        setIsBackendConnected(true)

        if (data.length > 0) {
          setPages(data)
          const savedActiveId = localStorage.getItem(STORAGE_ACTIVE_PAGE_KEY)
          const existingActive = data.find(item => item.id === savedActiveId)
          setActivePageId(existingActive ? existingActive.id : data[0].id)
        } else {
          const first = await notionPageService.create({
            title: DEFAULT_PAGES[0].title,
            icon: DEFAULT_PAGES[0].icon,
            blocks: DEFAULT_PAGES[0].blocks
          })

          if (!mounted) return
          const created = normalizePage(first.data)
          setPages([created])
          setActivePageId(created.id)
        }
      } catch {
        if (!mounted) return
        setIsBackendConnected(false)

        try {
          const raw = localStorage.getItem(STORAGE_FALLBACK_PAGES_KEY)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed) && parsed.length > 0) {
              const normalized = parsed.map(normalizePage)
              setPages(normalized)
              const savedActiveId = localStorage.getItem(STORAGE_ACTIVE_PAGE_KEY)
              const existingActive = normalized.find(item => item.id === savedActiveId)
              setActivePageId(existingActive ? existingActive.id : normalized[0].id)
            } else {
              setPages(DEFAULT_PAGES)
              setActivePageId(DEFAULT_PAGES[0].id)
            }
          } else {
            setPages(DEFAULT_PAGES)
            setActivePageId(DEFAULT_PAGES[0].id)
          }
        } catch {
          setPages(DEFAULT_PAGES)
          setActivePageId(DEFAULT_PAGES[0].id)
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadPages()

    return () => {
      mounted = false
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!pages.length) return
    try {
      localStorage.setItem(STORAGE_FALLBACK_PAGES_KEY, JSON.stringify(pages))
    } catch {
      return
    }
  }, [pages])

  useEffect(() => {
    if (!activePageId) return
    try {
      localStorage.setItem(STORAGE_ACTIVE_PAGE_KEY, activePageId)
    } catch {
      return
    }
  }, [activePageId])

  const focusBlock = (blockId, cursor = 'end') => {
    setTimeout(() => {
      const element = blockRefs.current[blockId]
      if (!element) return
      element.focus()
      if (cursor === 'start') {
        element.setSelectionRange(0, 0)
      } else {
        const length = element.value.length
        element.setSelectionRange(length, length)
      }
    }, 0)
  }

  const autoResize = (element) => {
    if (!element) return
    element.style.height = 'auto'
    element.style.height = `${element.scrollHeight}px`
  }

  const updatePage = (pageId, updater) => {
    setPages(prev => prev.map(page => {
      if (page.id !== pageId) return page
      const updatedPage = normalizePage(updater(page))
      schedulePageSave(updatedPage)
      return updatedPage
    }))
  }

  const addPage = async () => {
    const localId = `page-${Date.now()}`
    const basePage = {
      id: localId,
      icon: '📝',
      title: 'Untitled',
      blocks: [createBlock('h1', 'Untitled'), createBlock('paragraph', '')]
    }

    if (isBackendConnected) {
      try {
        const response = await notionPageService.create({
          icon: basePage.icon,
          title: basePage.title,
          blocks: basePage.blocks
        })
        const created = normalizePage(response.data)
        setPages(prev => [created, ...prev])
        setActivePageId(created.id)
        return
      } catch {
        setIsBackendConnected(false)
      }
    }

    setPages(prev => [basePage, ...prev])
    setActivePageId(basePage.id)
  }

  const deletePage = async (pageId) => {
    if (pages.length <= 1) return

    const nextPages = pages.filter(page => page.id !== pageId)
    setPages(nextPages)

    if (activePageId === pageId) {
      setActivePageId(nextPages[0].id)
    }

    if (isBackendConnected) {
      try {
        await notionPageService.delete(pageId)
      } catch {
        setSaveState('error')
      }
    }
  }

  const updatePageTitle = (title) => {
    if (!activePage) return
    updatePage(activePage.id, page => ({ ...page, title }))
  }

  const insertBlockAfter = (blockId, type = 'paragraph', presetContent = '') => {
    let newBlockId = ''
    if (!activePage) return newBlockId

    updatePage(activePage.id, page => {
      const index = page.blocks.findIndex(block => block.id === blockId)
      const next = [...page.blocks]
      const newBlock = createBlock(type, presetContent)
      newBlockId = newBlock.id
      next.splice(index + 1, 0, newBlock)
      return { ...page, blocks: next }
    })

    return newBlockId
  }

  const addBlock = (type) => {
    if (!activePage) return

    let newBlockId = ''
    updatePage(activePage.id, page => {
      const next = [...page.blocks]
      const newBlock = createBlock(type)
      newBlockId = newBlock.id
      next.push(newBlock)
      return { ...page, blocks: next }
    })

    if (type !== 'table' && type !== 'database' && type !== 'divider') {
      focusBlock(newBlockId)
    }
  }

  const updateBlock = (blockId, patch) => {
    if (!activePage) return

    updatePage(activePage.id, page => ({
      ...page,
      blocks: page.blocks.map(block => (block.id === blockId ? normalizeBlock({ ...block, ...patch }) : block))
    }))
  }

  const removeBlock = (blockId) => {
    if (!activePage) return

    const currentBlocks = activePage.blocks
    if (currentBlocks.length <= 1) return
    const index = currentBlocks.findIndex(block => block.id === blockId)
    const previous = currentBlocks[index - 1]

    updatePage(activePage.id, page => ({
      ...page,
      blocks: page.blocks.filter(block => block.id !== blockId)
    }))

    if (previous && isTextBlock(previous.type)) {
      focusBlock(previous.id)
    }
  }

  const convertBlockType = (blockId, type) => {
    if (!activePage) return

    updatePage(activePage.id, page => ({
      ...page,
      blocks: page.blocks.map(block => {
        if (block.id !== blockId) return block
        if (type === 'divider') return { ...block, type: 'divider', content: '', checked: undefined, table: undefined, database: undefined }
        if (type === 'table') return { ...block, type: 'table', content: '', checked: undefined, table: normalizeTableShape(block.table), database: undefined }
        if (type === 'database') return { ...block, type: 'database', content: '', checked: undefined, table: undefined, database: normalizeDatabaseShape(block.database) }
        if (type === 'todo') return { ...block, type: 'todo', checked: block.checked ?? false, table: undefined, database: undefined }
        return { ...block, type, checked: undefined, table: undefined, database: undefined }
      })
    }))

    if (type !== 'divider' && type !== 'table' && type !== 'database') focusBlock(blockId)
  }

  const moveBlockWithButtons = (blockId, direction) => {
    if (!activePage) return

    updatePage(activePage.id, page => {
      const index = page.blocks.findIndex(block => block.id === blockId)
      const target = index + direction
      if (index < 0 || target < 0 || target >= page.blocks.length) return page
      const blocks = [...page.blocks]
      const temp = blocks[index]
      blocks[index] = blocks[target]
      blocks[target] = temp
      return { ...page, blocks }
    })
  }

  const updateTableHeader = (blockId, columnIndex, value) => {
    const block = activePage?.blocks.find(item => item.id === blockId)
    if (!block || block.type !== 'table') return
    const table = normalizeTableShape(block.table)
    const columns = [...table.columns]
    columns[columnIndex] = value
    updateBlock(blockId, { table: { ...table, columns } })
  }

  const updateTableCell = (blockId, rowIndex, columnIndex, value) => {
    const block = activePage?.blocks.find(item => item.id === blockId)
    if (!block || block.type !== 'table') return
    const table = normalizeTableShape(block.table)
    const rows = table.rows.map(row => [...row])
    rows[rowIndex][columnIndex] = value
    updateBlock(blockId, { table: { ...table, rows } })
  }

  const addTableRow = (blockId) => {
    const block = activePage?.blocks.find(item => item.id === blockId)
    if (!block || block.type !== 'table') return
    const table = normalizeTableShape(block.table)
    const rows = [...table.rows, table.columns.map(() => '')]
    updateBlock(blockId, { table: { ...table, rows } })
  }

  const addTableColumn = (blockId) => {
    const block = activePage?.blocks.find(item => item.id === blockId)
    if (!block || block.type !== 'table') return
    const table = normalizeTableShape(block.table)
    const columns = [...table.columns, `Column ${table.columns.length + 1}`]
    const rows = table.rows.map(row => [...row, ''])
    updateBlock(blockId, { table: { columns, rows } })
  }

  const updateDatabaseColumn = (blockId, columnId, patch) => {
    const block = activePage?.blocks.find(item => item.id === blockId)
    if (!block || block.type !== 'database') return

    const database = normalizeDatabaseShape(block.database)
    const columns = database.columns.map(column => {
      if (column.id !== columnId) return column
      const nextType = patch.type || column.type
      return {
        ...column,
        ...patch,
        options: nextType === 'select'
          ? (patch.options || column.options || ['Option 1', 'Option 2'])
          : []
      }
    })

    const rows = database.rows.map(row => {
      const nextRow = { ...row }
      const changedColumn = columns.find(column => column.id === columnId)
      if (changedColumn?.type === 'checkbox') {
        nextRow[columnId] = Boolean(nextRow[columnId])
      } else if (changedColumn?.type === 'number') {
        nextRow[columnId] = nextRow[columnId] === '' ? '' : Number(nextRow[columnId])
      } else if (typeof nextRow[columnId] !== 'string') {
        nextRow[columnId] = ''
      }
      return nextRow
    })

    updateBlock(blockId, { database: { columns, rows } })
  }

  const addDatabaseColumn = (blockId) => {
    const block = activePage?.blocks.find(item => item.id === blockId)
    if (!block || block.type !== 'database') return

    const database = normalizeDatabaseShape(block.database)
    const newColumn = {
      id: `col-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      name: `Column ${database.columns.length + 1}`,
      type: 'text',
      options: []
    }

    const columns = [...database.columns, newColumn]
    const rows = database.rows.map(row => ({ ...row, [newColumn.id]: '' }))
    updateBlock(blockId, { database: { columns, rows } })
  }

  const addDatabaseRow = (blockId) => {
    const block = activePage?.blocks.find(item => item.id === blockId)
    if (!block || block.type !== 'database') return

    const database = normalizeDatabaseShape(block.database)
    const row = {}
    database.columns.forEach(column => {
      row[column.id] = column.type === 'checkbox' ? false : ''
    })

    updateBlock(blockId, { database: { ...database, rows: [...database.rows, row] } })
  }

  const updateDatabaseCell = (blockId, rowIndex, columnId, value) => {
    const block = activePage?.blocks.find(item => item.id === blockId)
    if (!block || block.type !== 'database') return

    const database = normalizeDatabaseShape(block.database)
    const column = database.columns.find(item => item.id === columnId)
    if (!column) return

    const rows = database.rows.map((row, index) => {
      if (index !== rowIndex) return row
      const nextRow = { ...row }
      if (column.type === 'checkbox') {
        nextRow[columnId] = Boolean(value)
      } else if (column.type === 'number') {
        nextRow[columnId] = value === '' ? '' : Number(value)
      } else {
        nextRow[columnId] = value
      }
      return nextRow
    })

    updateBlock(blockId, { database: { ...database, rows } })
  }

  const onBlockChange = (block, value) => {
    updateBlock(block.id, { content: value })

    if (value.startsWith('/')) {
      setSlashState({ visible: true, blockId: block.id, query: value.slice(1).trimStart() })
      return
    }

    if (slashState.visible && slashState.blockId === block.id) {
      setSlashState({ visible: false, blockId: '', query: '' })
    }
  }

  const onSelectSlashCommand = (blockId, type) => {
    convertBlockType(blockId, type)
    const block = activePage?.blocks.find(item => item.id === blockId)
    if (block && (block.content || '').startsWith('/')) {
      updateBlock(blockId, { content: '' })
    }
    setSlashState({ visible: false, blockId: '', query: '' })
  }

  const onBlockKeyDown = (event, block, index) => {
    const input = event.currentTarget
    const value = input.value
    const cursorStart = input.selectionStart
    const cursorEnd = input.selectionEnd

    if (event.key === 'Escape' && slashState.visible && slashState.blockId === block.id) {
      event.preventDefault()
      setSlashState({ visible: false, blockId: '', query: '' })
      return
    }

    if (event.key === 'Enter' && !event.shiftKey && block.type !== 'code') {
      event.preventDefault()

      const currentContent = value
      const before = currentContent.slice(0, cursorStart)
      const after = currentContent.slice(cursorEnd)
      const nextType = nextBlockTypeFromEnter(block.type, currentContent)

      if ((block.type === 'bulleted' || block.type === 'numbered' || block.type === 'todo') && !currentContent.trim()) {
        convertBlockType(block.id, 'paragraph')
        return
      }

      updateBlock(block.id, { content: before })
      const createdId = insertBlockAfter(block.id, nextType, after)
      if (createdId && isTextBlock(nextType)) focusBlock(createdId, 'start')
      setSlashState({ visible: false, blockId: '', query: '' })
      return
    }

    if (event.key === 'Backspace' && !value && activePage?.blocks.length > 1) {
      event.preventDefault()
      const previous = activePage.blocks[index - 1]
      removeBlock(block.id)
      if (previous && isTextBlock(previous.type)) {
        focusBlock(previous.id)
      }
      return
    }

    if (event.key === 'ArrowUp' && cursorStart === 0 && cursorEnd === 0) {
      const previous = activePage?.blocks[index - 1]
      if (previous && isTextBlock(previous.type)) {
        event.preventDefault()
        focusBlock(previous.id)
      }
      return
    }

    if (event.key === 'ArrowDown' && cursorStart === value.length && cursorEnd === value.length) {
      const next = activePage?.blocks[index + 1]
      if (next && isTextBlock(next.type)) {
        event.preventDefault()
        focusBlock(next.id, 'start')
      }
    }
  }

  const getPrefix = (blockType, index) => {
    if (blockType === 'bulleted') return '•'
    if (blockType === 'numbered') {
      const before = activePage.blocks.slice(0, index + 1)
      const count = before.filter(item => item.type === 'numbered').length
      return `${count}.`
    }
    return ''
  }

  const resetWorkspace = async () => {
    if (!isBackendConnected) {
      setPages(DEFAULT_PAGES)
      setActivePageId(DEFAULT_PAGES[0].id)
      setSlashState({ visible: false, blockId: '', query: '' })
      setPageSearch('')
      return
    }

    try {
      await Promise.all(pages.map(page => notionPageService.delete(page.id)))
      const created = await notionPageService.create({
        title: DEFAULT_PAGES[0].title,
        icon: DEFAULT_PAGES[0].icon,
        blocks: DEFAULT_PAGES[0].blocks
      })
      const page = normalizePage(created.data)
      setPages([page])
      setActivePageId(page.id)
      setSlashState({ visible: false, blockId: '', query: '' })
      setPageSearch('')
    } catch {
      setSaveState('error')
    }
  }

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 78px)' }}>
        <div className="text-muted">Chargement de votre workspace...</div>
      </div>
    )
  }

  return (
    <div className="d-flex" style={{ minHeight: 'calc(100vh - 78px)', backgroundColor: '#ffffff' }}>
      <aside style={{ width: '300px', borderRight: '1px solid #eceef3', backgroundColor: '#fbfbfb' }}>
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
          <div>
            <div className="fw-bold">Workspace</div>
            <small className="text-muted">{isBackendConnected ? 'Connecté au backend' : 'Mode local (fallback)'}</small>
          </div>
          <button type="button" className="btn btn-sm btn-light" onClick={addPage}>
            <i className="feather-plus"></i>
          </button>
        </div>

        <div className="p-2 border-bottom">
          <input
            className="form-control form-control-sm"
            placeholder="Search pages..."
            value={pageSearch}
            onChange={(event) => setPageSearch(event.target.value)}
          />
        </div>

        <div className="p-2" style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
          {filteredPages.map(page => (
            <button
              key={page.id}
              type="button"
              onClick={() => setActivePageId(page.id)}
              className={`btn w-100 text-start mb-1 d-flex align-items-center justify-content-between ${activePage?.id === page.id ? 'btn-light' : 'btn-white'}`}
            >
              <span className="d-inline-flex align-items-center gap-2 text-truncate">
                <span>{page.icon}</span>
                <span className="text-truncate" style={{ maxWidth: '160px' }}>{page.title || 'Untitled'}</span>
              </span>
              <span className="d-inline-flex gap-1 align-items-center">
                <span className="badge bg-soft-secondary text-secondary">{page.blocks.length}</span>
                {pages.length > 1 && (
                  <span
                    className="text-danger"
                    onClick={(event) => {
                      event.stopPropagation()
                      deletePage(page.id)
                    }}
                  >
                    <i className="feather-trash-2"></i>
                  </span>
                )}
              </span>
            </button>
          ))}

          {!filteredPages.length && (
            <div className="text-muted fs-12 p-2">No page found.</div>
          )}
        </div>

        <div className="p-2 border-top d-flex align-items-center gap-2">
          <button type="button" className="btn btn-sm btn-light flex-grow-1" onClick={resetWorkspace}>
            <i className="feather-refresh-ccw me-2"></i>
            Reset workspace
          </button>
          <span className={`fs-11 ${saveState === 'error' ? 'text-danger' : 'text-muted'}`}>
            {saveState === 'saving' ? 'Saving...' : saveState === 'error' ? 'Sync error' : 'Saved'}
          </span>
        </div>
      </aside>

      <main className="flex-grow-1">
        <div className="border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
          <div className="text-muted fs-12">Workspace / Pages / {activePage?.title || 'Untitled'}</div>
          <div className="d-flex align-items-center gap-2">
            <button type="button" className="btn btn-sm btn-light">Share</button>
            <button type="button" className="btn btn-sm btn-light">Favorite</button>
          </div>
        </div>

        <div className="px-4 py-4" style={{ maxWidth: '1040px' }}>
          <input
            className="form-control border-0 shadow-none px-0 fs-1 fw-bold"
            value={activePage?.title || ''}
            onChange={(event) => updatePageTitle(event.target.value)}
            placeholder="Untitled"
          />

          <div className="d-flex flex-wrap gap-2 mb-4">
            {BLOCK_TYPES.map(type => (
              <button key={type.key} type="button" className="btn btn-sm btn-light" onClick={() => addBlock(type.key)}>
                <i className={`${type.icon} me-2`}></i>
                {type.label}
              </button>
            ))}
          </div>

          <div className="d-flex flex-column gap-1">
            {activePage?.blocks.map((block, index) => (
              <div
                key={block.id}
                className="position-relative border rounded-3 p-2"
                draggable
                onDragStart={() => setDraggedBlockId(block.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  updatePage(activePage.id, page => ({ ...page, blocks: reorderBlocks(page.blocks, draggedBlockId, block.id) }))
                  setDraggedBlockId('')
                }}
              >
                <div className="d-flex align-items-start gap-2">
                  <button type="button" className="btn btn-sm btn-light py-0 px-1" title="Drag block">
                    <i className="feather-move"></i>
                  </button>

                  {(block.type === 'bulleted' || block.type === 'numbered') && (
                    <div className="pt-2 fw-semibold text-muted" style={{ minWidth: '20px' }}>{getPrefix(block.type, index)}</div>
                  )}

                  {block.type === 'todo' && (
                    <input
                      className="form-check-input mt-2"
                      type="checkbox"
                      checked={Boolean(block.checked)}
                      onChange={(event) => updateBlock(block.id, { checked: event.target.checked })}
                    />
                  )}

                  <div className="flex-grow-1">
                    {block.type === 'divider' && <hr className="my-2" />}

                    {block.type === 'database' && (
                      <div className="border rounded-3 p-2 bg-white">
                        <div className="table-responsive">
                          <table className="table table-sm align-middle mb-2">
                            <thead>
                              <tr>
                                {normalizeDatabaseShape(block.database).columns.map(column => (
                                  <th key={`${block.id}-db-h-${column.id}`} style={{ minWidth: '180px' }}>
                                    <div className="d-flex flex-column gap-1">
                                      <input
                                        className="form-control form-control-sm"
                                        value={column.name}
                                        onChange={(event) => updateDatabaseColumn(block.id, column.id, { name: event.target.value })}
                                      />
                                      <select
                                        className="form-select form-select-sm"
                                        value={column.type}
                                        onChange={(event) => updateDatabaseColumn(block.id, column.id, { type: event.target.value })}
                                      >
                                        <option value="text">Text</option>
                                        <option value="select">Select</option>
                                        <option value="date">Date</option>
                                        <option value="checkbox">Checkbox</option>
                                        <option value="number">Number</option>
                                      </select>
                                      {column.type === 'select' && (
                                        <input
                                          className="form-control form-control-sm"
                                          value={(column.options || []).join(', ')}
                                          onChange={(event) => {
                                            const options = event.target.value
                                              .split(',')
                                              .map(item => item.trim())
                                              .filter(Boolean)
                                            updateDatabaseColumn(block.id, column.id, { options: options.length ? options : ['Option 1'] })
                                          }}
                                          placeholder="option1, option2"
                                        />
                                      )}
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {normalizeDatabaseShape(block.database).rows.map((row, rowIndex) => (
                                <tr key={`${block.id}-db-r-${rowIndex}`}>
                                  {normalizeDatabaseShape(block.database).columns.map(column => {
                                    const value = row[column.id]
                                    return (
                                      <td key={`${block.id}-db-c-${rowIndex}-${column.id}`}>
                                        {column.type === 'checkbox' && (
                                          <input
                                            type="checkbox"
                                            className="form-check-input"
                                            checked={Boolean(value)}
                                            onChange={(event) => updateDatabaseCell(block.id, rowIndex, column.id, event.target.checked)}
                                          />
                                        )}

                                        {column.type === 'date' && (
                                          <input
                                            type="date"
                                            className="form-control form-control-sm"
                                            value={typeof value === 'string' ? value : ''}
                                            onChange={(event) => updateDatabaseCell(block.id, rowIndex, column.id, event.target.value)}
                                          />
                                        )}

                                        {column.type === 'number' && (
                                          <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            value={value ?? ''}
                                            onChange={(event) => updateDatabaseCell(block.id, rowIndex, column.id, event.target.value)}
                                          />
                                        )}

                                        {column.type === 'select' && (
                                          <select
                                            className="form-select form-select-sm"
                                            value={typeof value === 'string' ? value : ''}
                                            onChange={(event) => updateDatabaseCell(block.id, rowIndex, column.id, event.target.value)}
                                          >
                                            {(column.options || []).map(option => (
                                              <option key={option} value={option}>{option}</option>
                                            ))}
                                          </select>
                                        )}

                                        {column.type === 'text' && (
                                          <input
                                            className="form-control form-control-sm"
                                            value={typeof value === 'string' ? value : ''}
                                            onChange={(event) => updateDatabaseCell(block.id, rowIndex, column.id, event.target.value)}
                                          />
                                        )}
                                      </td>
                                    )
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="d-flex gap-2">
                          <button type="button" className="btn btn-sm btn-light" onClick={() => addDatabaseRow(block.id)}>
                            <i className="feather-plus me-1"></i>
                            Row
                          </button>
                          <button type="button" className="btn btn-sm btn-light" onClick={() => addDatabaseColumn(block.id)}>
                            <i className="feather-plus me-1"></i>
                            Column
                          </button>
                        </div>
                      </div>
                    )}

                    {block.type === 'table' && (
                      <div className="border rounded-3 p-2">
                        <div className="table-responsive">
                          <table className="table table-sm mb-2">
                            <thead>
                              <tr>
                                {normalizeTableShape(block.table).columns.map((header, colIndex) => (
                                  <th key={`${block.id}-h-${colIndex}`}>
                                    <input
                                      className="form-control form-control-sm"
                                      value={header}
                                      onChange={(event) => updateTableHeader(block.id, colIndex, event.target.value)}
                                    />
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {normalizeTableShape(block.table).rows.map((row, rowIndex) => (
                                <tr key={`${block.id}-r-${rowIndex}`}>
                                  {row.map((cell, colIndex) => (
                                    <td key={`${block.id}-c-${rowIndex}-${colIndex}`}>
                                      <input
                                        className="form-control form-control-sm"
                                        value={cell}
                                        onChange={(event) => updateTableCell(block.id, rowIndex, colIndex, event.target.value)}
                                      />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="d-flex gap-2">
                          <button type="button" className="btn btn-sm btn-light" onClick={() => addTableRow(block.id)}>
                            <i className="feather-plus me-1"></i>
                            Row
                          </button>
                          <button type="button" className="btn btn-sm btn-light" onClick={() => addTableColumn(block.id)}>
                            <i className="feather-plus me-1"></i>
                            Column
                          </button>
                        </div>
                      </div>
                    )}

                    {block.type !== 'divider' && block.type !== 'table' && block.type !== 'database' && (
                      <textarea
                        ref={(element) => {
                          if (!element) return
                          blockRefs.current[block.id] = element
                          autoResize(element)
                        }}
                        rows={1}
                        value={block.content || ''}
                        onChange={(event) => {
                          autoResize(event.currentTarget)
                          onBlockChange(block, event.target.value)
                        }}
                        onKeyDown={(event) => onBlockKeyDown(event, block, index)}
                        className={`form-control border-0 shadow-none px-0 resize-none ${blockStyle(block.type)} ${block.type === 'todo' && block.checked ? 'text-decoration-line-through text-muted' : ''}`}
                        placeholder="Type '/' for commands"
                      />
                    )}

                    {slashState.visible && slashState.blockId === block.id && slashOptions.length > 0 && block.type !== 'table' && block.type !== 'database' && (
                      <div className="border rounded-3 bg-white shadow-sm p-2 mt-2" style={{ maxWidth: '320px' }}>
                        {slashOptions.map(option => (
                          <button
                            key={option.key}
                            type="button"
                            className="btn btn-sm btn-light w-100 text-start mb-1"
                            onClick={() => onSelectSlashCommand(block.id, option.key)}
                          >
                            <i className={`${option.icon} me-2`}></i>
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="d-flex flex-column gap-1">
                    <button type="button" className="btn btn-sm btn-light py-0 px-1" onClick={() => moveBlockWithButtons(block.id, -1)} disabled={index === 0}>
                      <i className="feather-chevron-up"></i>
                    </button>
                    <button type="button" className="btn btn-sm btn-light py-0 px-1" onClick={() => moveBlockWithButtons(block.id, 1)} disabled={index === (activePage.blocks.length - 1)}>
                      <i className="feather-chevron-down"></i>
                    </button>
                    <button type="button" className="btn btn-sm btn-light text-danger py-0 px-1" onClick={() => removeBlock(block.id)}>
                      <i className="feather-trash-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
