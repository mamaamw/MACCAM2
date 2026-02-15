import { useMemo, useState } from 'react'

const VIEW_OPTIONS = [
  { value: 'All Tasks', label: 'All Tasks', icon: 'feather-hash' },
  { value: 'My Tasks', label: 'My Tasks', icon: 'feather-check-circle' },
  { value: 'Kanban', label: 'Kanban', icon: 'feather-columns' },
  { value: 'Overviews', label: 'Overviews', icon: 'feather-monitor' },
  { value: 'Pending Tasks', label: 'Pending Tasks', icon: 'feather-clock' },
  { value: 'InProgress Tasks', label: 'InProgress Tasks', icon: 'feather-activity' }
]
const SORT_OPTIONS = ['Newest', 'Oldest', 'Priority']
const STATUS_OPTIONS = ['All', 'New', 'Pending', 'Inprogress', 'Completed']
const INITIAL_LABEL_OPTIONS = ['Updates', 'Socials', 'Primary', 'Forums', 'Promotions']
const INITIAL_TAG_OPTIONS = ['Office', 'Family', 'Friend', 'Marketplace', 'Development']
const DEFAULT_SELECTED_LABELS = ['Primary', 'Promotions']
const DEFAULT_SELECTED_TAGS = ['Office', 'Family', 'Friend']
const ASSIGNEE_AVATAR_BY_EMAIL = {
  'alex@outlook.com': '/assets/images/avatar/1.png',
  'john.deo@outlook.com': '/assets/images/avatar/2.png',
  'green.cutte@outlook.com': '/assets/images/avatar/3.png',
  'nancy.elliot@outlook.com': '/assets/images/avatar/4.png',
  'mar.audrey@gmail.com': '/assets/images/avatar/5.png'
}

const PRIORITY_DOT = {
  Low: 'bg-dark',
  Normal: 'bg-success',
  Medium: 'bg-primary',
  High: 'bg-warning',
  Urgent: 'bg-danger'
}

const PRIORITY_BADGE = {
  Low: 'bg-soft-success text-success',
  Normal: 'bg-soft-primary text-primary',
  Medium: 'bg-soft-warning text-warning',
  High: 'bg-soft-danger text-danger',
  Urgent: 'bg-soft-danger text-danger'
}

const CATEGORY_BADGE = {
  Calls: 'bg-soft-primary text-primary',
  Conferences: 'bg-soft-success text-success',
  Meetings: 'bg-soft-teal text-teal',
  Project: 'bg-soft-warning text-warning'
}

const seedTasks = [
  { id: 1, title: 'Video conference with Canada Team', description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.', status: 'Inprogress', priority: 'High', category: 'Calls', dueDate: '2026-02-27', assignee: '/assets/images/avatar/1.png', group: 'Recently Assigned', starred: false, completed: false, labels: ['Primary'], tags: ['Office'], isRead: true, archived: false, isSpam: false, snoozedUntil: null },
  { id: 2, title: 'Client objective meeting', description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.', status: 'Pending', priority: 'Normal', category: 'Conferences', dueDate: '2026-02-22', assignee: '/assets/images/avatar/2.png', group: 'Recently Assigned', starred: false, completed: false, labels: ['Updates'], tags: ['Family'], isRead: false, archived: false, isSpam: false, snoozedUntil: null },
  { id: 3, title: 'Target market trend analysis on the go', description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.', status: 'Inprogress', priority: 'Medium', category: 'Meetings', dueDate: '2026-02-23', assignee: '/assets/images/avatar/3.png', group: 'Recently Assigned', starred: false, completed: false, labels: ['Socials'], tags: ['Friend'], isRead: true, archived: false, isSpam: false, snoozedUntil: null },
  { id: 4, title: 'Send revised proposal to Mr. Dow Jones', description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.', status: 'Completed', priority: 'Low', category: 'Calls', dueDate: '2026-02-28', assignee: '/assets/images/avatar/4.png', group: 'Recently Assigned', starred: false, completed: true, labels: ['Promotions'], tags: ['Marketplace'], isRead: false, archived: false, isSpam: false, snoozedUntil: null },
  { id: 5, title: 'Set up first call for demo', description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.', status: 'New', priority: 'Urgent', category: 'Project', dueDate: '2026-03-01', assignee: '/assets/images/avatar/5.png', group: 'Recently Assigned', starred: false, completed: false, labels: ['Forums'], tags: ['Development'], isRead: true, archived: false, isSpam: false, snoozedUntil: null },
  { id: 6, title: 'Client objective meeting', description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.', status: 'Pending', priority: 'Normal', category: 'Conferences', dueDate: '2026-02-22', assignee: '/assets/images/avatar/2.png', group: 'Yesterday', starred: false, completed: false, labels: ['Updates'], tags: ['Family'], isRead: true, archived: false, isSpam: false, snoozedUntil: null },
  { id: 7, title: 'Target market trend analysis on the go', description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.', status: 'Inprogress', priority: 'Medium', category: 'Meetings', dueDate: '2026-02-23', assignee: '/assets/images/avatar/3.png', group: 'Yesterday', starred: false, completed: false, labels: ['Primary'], tags: ['Office'], isRead: false, archived: false, isSpam: false, snoozedUntil: null },
  { id: 8, title: 'Send revised proposal to Mr. Dow Jones', description: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.', status: 'Completed', priority: 'Low', category: 'Calls', dueDate: '2026-02-28', assignee: '/assets/images/avatar/4.png', group: 'Yesterday', starred: false, completed: true, labels: ['Promotions'], tags: ['Friend'], isRead: true, archived: false, isSpam: false, snoozedUntil: null }
]

function formatDate(dateValue) {
  return new Date(dateValue).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function priorityRank(priority) {
  const order = { Urgent: 5, High: 4, Medium: 3, Normal: 2, Low: 1 }
  return order[priority] || 0
}

export default function Tasks() {
  const [tasks, setTasks] = useState(seedTasks)
  const [labels, setLabels] = useState(INITIAL_LABEL_OPTIONS)
  const [tags, setTags] = useState(INITIAL_TAG_OPTIONS)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewFilter, setViewFilter] = useState('My Tasks')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [selectedLabels, setSelectedLabels] = useState(DEFAULT_SELECTED_LABELS)
  const [selectedTags, setSelectedTags] = useState(DEFAULT_SELECTED_TAGS)
  const [visibilityFilter, setVisibilityFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('Newest')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [taskModalMode, setTaskModalMode] = useState('create')
  const [showCreateLabelModal, setShowCreateLabelModal] = useState(false)
  const [showManageLabelsModal, setShowManageLabelsModal] = useState(false)
  const [showCreateTagModal, setShowCreateTagModal] = useState(false)
  const [showManageTagsModal, setShowManageTagsModal] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelError, setNewLabelError] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [newTagError, setNewTagError] = useState('')
  const [draggedLabel, setDraggedLabel] = useState(null)
  const [draggedTag, setDraggedTag] = useState(null)
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Inprogress',
    priority: 'High',
    assignee: 'alex@outlook.com',
    tags: ['Office']
  })

  const openCreateTaskModal = () => {
    setTaskModalMode('create')
    setEditingTaskId(null)
    setNewTaskForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'Inprogress',
      priority: 'High',
      assignee: 'alex@outlook.com',
      tags: ['Office']
    })
    setShowAddModal(true)
  }

  const closeTaskModal = () => {
    setShowAddModal(false)
    setEditingTaskId(null)
    setTaskModalMode('create')
    setNewTaskForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'Inprogress',
      priority: 'High',
      assignee: 'alex@outlook.com',
      tags: ['Office']
    })
  }

  const selectedViewOption = VIEW_OPTIONS.find(option => option.value === viewFilter) || VIEW_OPTIONS[1]

  const activeFilterCount = useMemo(() => {
    const defaultLabels = DEFAULT_SELECTED_LABELS.filter(label => labels.includes(label))
    const defaultTags = DEFAULT_SELECTED_TAGS.filter(tag => tags.includes(tag))
    const sameSelection = (current, defaults) => current.length === defaults.length && current.every(item => defaults.includes(item))

    let count = 0
    if (searchQuery.trim()) count += 1
    if (viewFilter !== 'My Tasks') count += 1
    if (statusFilter !== 'All') count += 1
    if (priorityFilter !== 'All') count += 1
    if (!sameSelection(selectedLabels, defaultLabels)) count += 1
    if (!sameSelection(selectedTags, defaultTags)) count += 1
    if (visibilityFilter !== 'ALL') count += 1
    if (sortBy !== 'Newest') count += 1

    return count
  }, [searchQuery, viewFilter, statusFilter, priorityFilter, selectedLabels, selectedTags, visibilityFilter, sortBy, labels, tags])

  const hasActiveFilters = activeFilterCount > 0

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    let list = tasks.filter(task => {
      const matchesQuery = !query || task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query)
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter
      const matchesLabels = selectedLabels.length === 0 || (task.labels || []).some(label => selectedLabels.includes(label))
      const matchesTags = selectedTags.length === 0 || (task.tags || []).some(tag => selectedTags.includes(tag))
      const matchesVisibility = visibilityFilter === 'ALL'
        || (visibilityFilter === 'READ' && task.isRead)
        || (visibilityFilter === 'UNREAD' && !task.isRead)
        || (visibilityFilter === 'STARRED' && task.starred)
        || (visibilityFilter === 'UNSTARRED' && !task.starred)
      const matchesView = viewFilter === 'All Tasks'
        || viewFilter === 'Kanban'
        || viewFilter === 'Overviews'
        || (viewFilter === 'Pending Tasks' && task.status === 'Pending')
        || (viewFilter === 'InProgress Tasks' && task.status === 'Inprogress')
        || viewFilter === 'My Tasks'

      return matchesQuery
        && matchesStatus
        && matchesPriority
        && matchesLabels
        && matchesTags
        && matchesVisibility
        && !task.archived
        && !task.isSpam
        && matchesView
    })

    list = [...list].sort((a, b) => {
      if (sortBy === 'Oldest') return new Date(a.dueDate) - new Date(b.dueDate)
      if (sortBy === 'Priority') return priorityRank(b.priority) - priorityRank(a.priority)
      return new Date(b.dueDate) - new Date(a.dueDate)
    })

    return list
  }, [tasks, searchQuery, viewFilter, statusFilter, priorityFilter, selectedLabels, selectedTags, visibilityFilter, sortBy])

  const filteredTaskIds = useMemo(() => filteredTasks.map(task => task.id), [filteredTasks])

  const groupedTasks = useMemo(() => {
    const groups = ['Recently Assigned', 'Yesterday']
    return groups.reduce((accumulator, group) => {
      accumulator[group] = filteredTasks.filter(task => task.group === group)
      return accumulator
    }, {})
  }, [filteredTasks])

  const kanbanColumns = useMemo(() => {
    return [
      { key: 'todo', label: 'Todo', status: 'New', tasks: filteredTasks.filter(task => task.status === 'New') },
      { key: 'pending', label: 'Pending', status: 'Pending', tasks: filteredTasks.filter(task => task.status === 'Pending') },
      { key: 'inprogress', label: 'In Progress', status: 'Inprogress', tasks: filteredTasks.filter(task => task.status === 'Inprogress') },
      { key: 'done', label: 'Done', status: 'Completed', tasks: filteredTasks.filter(task => task.status === 'Completed') }
    ]
  }, [filteredTasks])

  const moveTaskToStatus = (taskId, nextStatus) => {
    if (!taskId || !nextStatus) return

    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task
      return {
        ...task,
        status: nextStatus,
        completed: nextStatus === 'Completed'
      }
    }))
  }

  const toggleTaskDone = (taskId) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task
      const completed = !task.completed
      return {
        ...task,
        completed,
        status: completed ? 'Completed' : task.status === 'Completed' ? 'Inprogress' : task.status
      }
    }))
  }

  const toggleTaskStar = (taskId) => {
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, starred: !task.starred } : task))
  }

  const addTask = (event) => {
    event.preventDefault()
    if (taskModalMode === 'view') return
    if (!newTaskForm.title.trim()) return

    if (editingTaskId) {
      setTasks(prev => prev.map(task => {
        if (task.id !== editingTaskId) return task
        return {
          ...task,
          title: newTaskForm.title.trim(),
          description: newTaskForm.description.trim() || 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.',
          status: newTaskForm.status,
          priority: newTaskForm.priority,
          dueDate: newTaskForm.endDate || newTaskForm.startDate || task.dueDate,
          assignee: ASSIGNEE_AVATAR_BY_EMAIL[newTaskForm.assignee] || '/assets/images/avatar/1.png',
          completed: newTaskForm.status === 'Completed',
          tags: [...newTaskForm.tags]
        }
      }))
      closeTaskModal()
      return
    }

    const task = {
      id: Date.now(),
      title: newTaskForm.title.trim(),
      description: newTaskForm.description.trim() || 'Lorem, ipsum dolor sit amet consectetur adipisicing elit.',
      status: newTaskForm.status,
      priority: newTaskForm.priority,
      category: 'Project',
      dueDate: newTaskForm.endDate || newTaskForm.startDate || new Date().toISOString().slice(0, 10),
      assignee: ASSIGNEE_AVATAR_BY_EMAIL[newTaskForm.assignee] || '/assets/images/avatar/1.png',
      group: 'Recently Assigned',
      starred: false,
      completed: newTaskForm.status === 'Completed',
      labels: [...selectedLabels],
      tags: [...newTaskForm.tags],
      isRead: true,
      archived: false,
      isSpam: false,
      snoozedUntil: null
    }

    setTasks(prev => [task, ...prev])
    closeTaskModal()
  }

  const openEditTaskModal = (task) => {
    setTaskModalMode('edit')
    const assigneeEmail = Object.entries(ASSIGNEE_AVATAR_BY_EMAIL).find(([, avatar]) => avatar === task.assignee)?.[0] || 'alex@outlook.com'
    setEditingTaskId(task.id)
    setNewTaskForm({
      title: task.title || '',
      description: task.description || '',
      startDate: task.dueDate || '',
      endDate: task.dueDate || '',
      status: task.status || 'Inprogress',
      priority: task.priority || 'High',
      assignee: assigneeEmail,
      tags: [...(task.tags || [])]
    })
    setShowAddModal(true)
  }

  const openViewTaskModal = (task) => {
    setTaskModalMode('view')
    const assigneeEmail = Object.entries(ASSIGNEE_AVATAR_BY_EMAIL).find(([, avatar]) => avatar === task.assignee)?.[0] || 'alex@outlook.com'
    setEditingTaskId(task.id)
    setNewTaskForm({
      title: task.title || '',
      description: task.description || '',
      startDate: task.dueDate || '',
      endDate: task.dueDate || '',
      status: task.status || 'Inprogress',
      priority: task.priority || 'High',
      assignee: assigneeEmail,
      tags: [...(task.tags || [])]
    })
    setShowAddModal(true)
  }

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const isTaskViewMode = taskModalMode === 'view'

  const toggleLabelSelection = (label) => {
    setSelectedLabels(prev => (
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    ))
  }

  const toggleTaskTag = (label) => {
    setNewTaskForm(prev => {
      const alreadySelected = prev.tags.includes(label)
      if (alreadySelected) {
        return { ...prev, tags: prev.tags.filter(tag => tag !== label) }
      }
      return { ...prev, tags: [...prev.tags, label] }
    })
  }

  const handleCreateLabel = (event) => {
    event.preventDefault()
    const value = newLabelName.trim()

    if (!value) {
      setNewLabelError('Le nom du label est requis.')
      return
    }

    const exists = labels.some(label => label.toLowerCase() === value.toLowerCase())
    if (exists) {
      setNewLabelError('Ce label existe déjà.')
      return
    }

    setLabels(prev => [...prev, value])
    setSelectedLabels(prev => [...prev, value])
    setNewTaskForm(prev => ({ ...prev, tags: [...prev.tags, value] }))
    setNewLabelName('')
    setNewLabelError('')
    setShowCreateLabelModal(false)
  }

  const handleDeleteLabel = (labelToDelete) => {
    setLabels(prev => prev.filter(label => label !== labelToDelete))
    setSelectedLabels(prev => prev.filter(label => label !== labelToDelete))
    setNewTaskForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== labelToDelete)
    }))
    setTasks(prev => prev.map(task => ({
      ...task,
      labels: (task.labels || []).filter(label => label !== labelToDelete)
    })))
  }

  const toggleTagSelection = (tag) => {
    setSelectedTags(prev => (
      prev.includes(tag)
        ? prev.filter(item => item !== tag)
        : [...prev, tag]
    ))
  }

  const handleCreateTag = (event) => {
    event.preventDefault()
    const value = newTagName.trim()

    if (!value) {
      setNewTagError('Le nom du tag est requis.')
      return
    }

    const exists = tags.some(tag => tag.toLowerCase() === value.toLowerCase())
    if (exists) {
      setNewTagError('Ce tag existe déjà.')
      return
    }

    setTags(prev => [...prev, value])
    setSelectedTags(prev => [...prev, value])
    setNewTaskForm(prev => ({ ...prev, tags: [...prev.tags, value] }))
    setNewTagName('')
    setNewTagError('')
    setShowCreateTagModal(false)
  }

  const handleDeleteTag = (tagToDelete) => {
    setTags(prev => prev.filter(tag => tag !== tagToDelete))
    setSelectedTags(prev => prev.filter(tag => tag !== tagToDelete))
    setNewTaskForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToDelete)
    }))
    setTasks(prev => prev.map(task => ({
      ...task,
      tags: (task.tags || []).filter(tag => tag !== tagToDelete)
    })))
  }

  const snoozeFiltered = () => {
    if (!filteredTaskIds.length) return
    const idSet = new Set(filteredTaskIds)
    const snoozedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    setTasks(prev => prev.map(task => (idSet.has(task.id) ? { ...task, snoozedUntil } : task)))
  }

  const archiveFiltered = () => {
    if (!filteredTaskIds.length) return
    const idSet = new Set(filteredTaskIds)
    setTasks(prev => prev.map(task => (idSet.has(task.id) ? { ...task, archived: true } : task)))
  }

  const reportSpamFiltered = () => {
    if (!filteredTaskIds.length) return
    const idSet = new Set(filteredTaskIds)
    setTasks(prev => prev.map(task => (idSet.has(task.id) ? { ...task, isSpam: true } : task)))
  }

  const deleteFiltered = () => {
    if (!filteredTaskIds.length) return
    const idSet = new Set(filteredTaskIds)
    setTasks(prev => prev.filter(task => !idSet.has(task.id)))
  }

  const reorderLabels = (sourceLabel, targetLabel) => {
    if (!sourceLabel || !targetLabel || sourceLabel === targetLabel) return

    setLabels(prev => {
      const sourceIndex = prev.indexOf(sourceLabel)
      const targetIndex = prev.indexOf(targetLabel)

      if (sourceIndex < 0 || targetIndex < 0) return prev

      const next = [...prev]
      const [moved] = next.splice(sourceIndex, 1)
      next.splice(targetIndex, 0, moved)
      return next
    })
  }

  const reorderTags = (sourceTag, targetTag) => {
    if (!sourceTag || !targetTag || sourceTag === targetTag) return

    setTags(prev => {
      const sourceIndex = prev.indexOf(sourceTag)
      const targetIndex = prev.indexOf(targetTag)

      if (sourceIndex < 0 || targetIndex < 0) return prev

      const next = [...prev]
      const [moved] = next.splice(sourceIndex, 1)
      next.splice(targetIndex, 0, moved)
      return next
    })
  }

  const resetAllFilters = () => {
    setSearchQuery('')
    setViewFilter('My Tasks')
    setStatusFilter('All')
    setPriorityFilter('All')
    setSelectedLabels(DEFAULT_SELECTED_LABELS.filter(label => labels.includes(label)))
    setSelectedTags(DEFAULT_SELECTED_TAGS.filter(tag => tags.includes(tag)))
    setVisibilityFilter('ALL')
    setSortBy('Newest')
    setIsSearchOpen(false)
  }

  return (
    <div className="nxl-content without-header nxl-full-content">
      <div className="main-content d-flex" style={{ minHeight: 'calc(100vh - 78px)', backgroundColor: '#f4f5f9' }}>
        <div
          className="content-sidebar content-sidebar-md"
          data-scrollbar-target="#psScrollbarInit"
          style={{ borderRight: '1px solid var(--bs-border-color)', width: '275px', minWidth: '275px', backgroundColor: '#fff' }}
        >
          <div className="content-sidebar-header bg-white sticky-top hstack justify-content-between">
            <h4 className="fw-bolder mb-0">Tasks</h4>
          </div>

          <div className="content-sidebar-header">
            <button type="button" className="btn btn-primary w-100" onClick={openCreateTaskModal}>
              <i className="feather-plus me-2"></i>
              <span>Add Tasks</span>
            </button>
            <div className="d-flex justify-content-end mt-2">
              <button
                type="button"
                className={`btn btn-sm ${hasActiveFilters ? 'btn-link text-primary' : 'btn-link text-muted'} p-0 text-decoration-none`}
                onClick={resetAllFilters}
                disabled={!hasActiveFilters}
                title={hasActiveFilters ? `${activeFilterCount} active filter(s)` : 'No active filter'}
              >
                <i className="feather-rotate-ccw me-1"></i>
                <span>Reset filters</span>
              </button>
            </div>
          </div>

          <div className="content-sidebar-body">
            <ul className="nav flex-column nxl-content-sidebar-item">
              <li className="nav-item"><button type="button" className="nav-link w-100 text-start" onClick={() => setStatusFilter('New')}><i className="feather-list"></i><span>New</span></button></li>
              <li className="nav-item"><button type="button" className="nav-link w-100 text-start" onClick={() => setStatusFilter('Pending')}><i className="feather-watch"></i><span>Pending</span></button></li>
              <li className="nav-item"><button type="button" className="nav-link w-100 text-start" onClick={() => setStatusFilter('Inprogress')}><i className="feather-activity"></i><span>Inprogress</span></button></li>
              <li className="nav-item"><button type="button" className="nav-link w-100 text-start" onClick={() => setStatusFilter('Completed')}><i className="feather-check-circle"></i><span>Completed</span></button></li>
            </ul>

            <ul className="nav flex-column nxl-content-sidebar-item">
              <li className="px-4 my-2 fs-10 fw-bold text-uppercase text-muted text-spacing-1 d-flex align-items-center justify-content-between">
                <span>Priority</span>
                <span className="avatar-text avatar-sm"><i className="feather-plus"></i></span>
              </li>
              {['Low', 'Normal', 'Medium', 'High', 'Urgent'].map(priority => (
                <li className="nav-item" key={priority}>
                  <button type="button" className="nav-link w-100 text-start" onClick={() => setPriorityFilter(priority)}>
                    <span className={`wd-7 ht-7 rounded-circle ${PRIORITY_DOT[priority]}`}></span>
                    <span>{priority}</span>
                  </button>
                </li>
              ))}
            </ul>

            <ul className="nav flex-column nxl-content-sidebar-item">
              <li className="px-4 my-2 fs-10 fw-bold text-uppercase text-muted text-spacing-1 d-flex align-items-center justify-content-between">
                <span>Overview</span>
                <span className="avatar-text avatar-sm"><i className="feather-plus"></i></span>
              </li>
              <li className="nav-item"><a className="nav-link" href="#" onClick={(event) => event.preventDefault()}><i className="feather-hash"></i><span>Overview</span></a></li>
              <li className="nav-item"><a className="nav-link" href="#" onClick={(event) => event.preventDefault()}><i className="feather-hash"></i><span>My Tasks</span></a></li>
              <li className="nav-item"><a className="nav-link" href="#" onClick={(event) => event.preventDefault()}><i className="feather-hash"></i><span>Tasks Activity</span></a></li>
              <li className="nav-item"><a className="nav-link" href="#" onClick={(event) => event.preventDefault()}><i className="feather-hash"></i><span>Tasks Attachments</span></a></li>
            </ul>
          </div>
        </div>

        <div className="content-area" data-scrollbar-target="#psScrollbarInit" style={{ backgroundColor: '#f4f5f9' }}>
          <div className="content-area-header sticky-top" style={{ minHeight: '52px', paddingTop: '10px', paddingBottom: '10px' }}>
            <div className="page-header-left d-flex align-items-center gap-2">
              <div className="dropdown">
                <button type="button" className="btn btn-light-brand btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                  <i className={`${selectedViewOption.icon} me-2`}></i>
                  <span className="text-uppercase fw-bold">{selectedViewOption.label}</span>
                </button>
                <div className="dropdown-menu dropdown-menu-end">
                  {VIEW_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`dropdown-item ${viewFilter === option.value ? 'active' : ''}`}
                      onClick={() => setViewFilter(option.value)}
                    >
                      <i className={`${option.icon} me-2`}></i>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="dropdown">
                <button type="button" className="avatar-text avatar-md" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="feather-eye"></i>
                </button>
                <div className="dropdown-menu" style={{ minWidth: '230px' }}>
                  <button type="button" className="dropdown-item" onClick={() => setVisibilityFilter('READ')}>
                    <i className="feather-eye me-3"></i>
                    <span>Read</span>
                  </button>
                  <button type="button" className="dropdown-item" onClick={() => setVisibilityFilter('UNREAD')}>
                    <i className="feather-eye-off me-3"></i>
                    <span>Unread</span>
                  </button>
                  <button type="button" className="dropdown-item" onClick={() => setVisibilityFilter('STARRED')}>
                    <i className="feather-star me-3"></i>
                    <span>Starred</span>
                  </button>
                  <button type="button" className="dropdown-item" onClick={() => setVisibilityFilter('UNSTARRED')}>
                    <i className="feather-slash me-3"></i>
                    <span>Unstarred</span>
                  </button>

                  <div className="dropdown-divider"></div>

                  <button type="button" className="dropdown-item" onClick={snoozeFiltered}>
                    <i className="feather-clock me-3"></i>
                    <span>Snooze</span>
                  </button>
                  <button type="button" className="dropdown-item" onClick={openCreateTaskModal}>
                    <i className="feather-check-circle me-3"></i>
                    <span>Add Tasks</span>
                  </button>

                  <div className="dropdown-divider"></div>

                  <button type="button" className="dropdown-item" onClick={archiveFiltered}>
                    <i className="feather-archive me-3"></i>
                    <span>Archive</span>
                  </button>
                  <button type="button" className="dropdown-item" onClick={reportSpamFiltered}>
                    <i className="feather-alert-octagon me-3"></i>
                    <span>Report Spam</span>
                  </button>

                  <div className="dropdown-divider"></div>

                  <button type="button" className="dropdown-item" onClick={deleteFiltered}>
                    <i className="feather-trash-2 me-3"></i>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
              <div className="dropdown">
                <button type="button" className="avatar-text avatar-md" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                  <i className="feather-tag"></i>
                </button>
                <div className="dropdown-menu" style={{ minWidth: '230px' }}>
                  {tags.map(tag => {
                    const checked = selectedTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        className="dropdown-item"
                        onClick={() => toggleTagSelection(tag)}
                      >
                        <div className="form-check m-0 d-flex align-items-center gap-2">
                          <input className="form-check-input" type="checkbox" readOnly checked={checked} />
                          <span>{tag}</span>
                        </div>
                      </button>
                    )
                  })}

                  <div className="dropdown-divider"></div>
                  <a
                    href="#"
                    className="dropdown-item"
                    onClick={(event) => {
                      event.preventDefault()
                      setShowCreateTagModal(true)
                      setNewTagError('')
                    }}
                  >
                    <i className="feather-plus me-3"></i>
                    <span>Create Tag</span>
                  </a>
                  <a
                    href="#"
                    className="dropdown-item"
                    onClick={(event) => {
                      event.preventDefault()
                      setShowManageTagsModal(true)
                    }}
                  >
                    <i className="feather-tag me-3"></i>
                    <span>Manages Tag</span>
                  </a>
                </div>
              </div>

              <div className="dropdown">
                <button type="button" className="avatar-text avatar-md" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                  <i className="feather-folder-plus"></i>
                </button>
                <div className="dropdown-menu" style={{ minWidth: '230px' }}>
                  {labels.map(label => {
                    const checked = selectedLabels.includes(label)
                    return (
                      <button
                        key={label}
                        type="button"
                        className="dropdown-item"
                        onClick={() => {
                          toggleLabelSelection(label)
                        }}
                      >
                        <div className="form-check m-0 d-flex align-items-center gap-2">
                          <input className="form-check-input" type="checkbox" readOnly checked={checked} />
                          <span>{label}</span>
                        </div>
                      </button>
                    )
                  })}

                  <div className="dropdown-divider"></div>
                  <a
                    href="#"
                    className="dropdown-item"
                    onClick={(event) => {
                      event.preventDefault()
                      setShowCreateLabelModal(true)
                      setNewLabelError('')
                    }}
                  >
                    <i className="feather-plus me-3"></i>
                    <span>Create Label</span>
                  </a>
                  <a
                    href="#"
                    className="dropdown-item"
                    onClick={(event) => {
                      event.preventDefault()
                      setShowManageLabelsModal(true)
                    }}
                  >
                    <i className="feather-folder-plus me-3"></i>
                    <span>Manages Label</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="page-header-right ms-auto" style={{ flex: isSearchOpen ? 1 : 'unset', minWidth: 0 }}>
              {isSearchOpen ? (
                <div className="d-flex align-items-center gap-2 w-100">
                  <button
                    type="button"
                    className="avatar-text avatar-md"
                    onClick={() => setIsSearchOpen(false)}
                    aria-label="Close search"
                  >
                    <i className="feather-arrow-left"></i>
                  </button>
                  <input
                    type="search"
                    className="form-control border-0 bg-transparent"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
              ) : (
                <div className="hstack gap-2">
                  <button
                    type="button"
                    className="avatar-text avatar-md"
                    onClick={() => setIsSearchOpen(true)}
                    aria-label="Open search"
                  >
                    <i className="feather-search"></i>
                  </button>
                  <button type="button" className="avatar-text avatar-md d-none d-sm-flex"><i className="feather-chevron-left"></i></button>
                  <button type="button" className="avatar-text avatar-md d-none d-sm-flex"><i className="feather-chevron-right"></i></button>

                  <div className="dropdown d-none d-sm-flex">
                    <button type="button" className="btn btn-light-brand btn-sm rounded-pill dropdown-toggle" data-bs-toggle="dropdown">{sortBy}</button>
                    <div className="dropdown-menu dropdown-menu-end">
                      {SORT_OPTIONS.map(option => (
                        <button key={option} type="button" className={`dropdown-item ${sortBy === option ? 'active' : ''}`} onClick={() => setSortBy(option)}>{option}</button>
                      ))}
                    </div>
                  </div>

                  <button type="button" className="avatar-text avatar-md"><i className="feather-more-vertical"></i></button>
                </div>
              )}
            </div>
          </div>

          <div className="content-area-body" style={{ paddingTop: '6px' }}>
            {viewFilter === 'Kanban' ? (
              <div className="row g-3">
                {kanbanColumns.map(column => (
                  <div className="col-12 col-md-6 col-xl-3" key={column.key}>
                    <div className="card stretch stretch-full mb-0">
                      <div className="card-header d-flex align-items-center justify-content-between">
                        <h6 className="mb-0">{column.label}</h6>
                        <span className="badge bg-light text-muted">{column.tasks.length}</span>
                      </div>
                      <div
                        className="card-body"
                        style={{ minHeight: '320px' }}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault()
                          const rawTaskId = event.dataTransfer.getData('text/plain')
                          const droppedTaskId = Number(rawTaskId)
                          if (Number.isNaN(droppedTaskId)) return
                          moveTaskToStatus(droppedTaskId, column.status)
                        }}
                      >
                        {column.tasks.length === 0 && (
                          <div className="text-muted fs-12">No task in this column.</div>
                        )}

                        <div className="d-grid gap-2">
                          {column.tasks.map(task => (
                            <div
                              className={`border border-dashed rounded-3 p-3 ${task.completed ? 'bg-soft-success border-success-subtle' : 'bg-white'}`}
                              key={task.id}
                              draggable
                              onDragStart={(event) => {
                                event.dataTransfer.setData('text/plain', String(task.id))
                                event.dataTransfer.effectAllowed = 'move'
                              }}
                            >
                              <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                                <div className={`fs-13 fw-semibold text-truncate-2-line ${task.completed ? 'text-decoration-line-through text-success' : ''}`}>{task.title}</div>
                                <button type="button" className="btn btn-link p-0 lh-base" onClick={() => toggleTaskStar(task.id)}>
                                  <i className={`${task.starred ? 'feather-star text-warning' : `feather-star ${task.completed ? 'text-success' : 'text-muted'}`}`}></i>
                                </button>
                              </div>

                              <div className={`fs-12 text-truncate-2-line mb-2 ${task.completed ? 'text-success text-decoration-line-through' : 'text-muted'}`}>{task.description}</div>

                              <div className="d-flex align-items-center justify-content-between">
                                <span className={`badge ${PRIORITY_BADGE[task.priority]}`}>{task.priority}</span>
                                <div className="avatar-image avatar-sm">
                                  <img src={task.assignee} alt="user" className="img-fluid" />
                                </div>
                              </div>

                              <div className="d-flex align-items-center justify-content-between mt-2">
                                <small className={task.completed ? 'text-success' : 'text-muted'}>{formatDate(task.dueDate)}</small>
                                <div className="d-flex align-items-center gap-1">
                                  <button type="button" className="btn btn-sm btn-light" onClick={() => openEditTaskModal(task)}>
                                    <i className="feather-edit-3"></i>
                                  </button>
                                  <button type="button" className="btn btn-sm btn-light" onClick={() => deleteTask(task.id)}>
                                    <i className="feather-trash-2"></i>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-light"
                                    onClick={() => toggleTaskDone(task.id)}
                                  >
                                    {task.completed ? 'Undo' : 'Done'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
                <div className="card stretch stretch-full" key={groupName} style={{ marginBottom: '14px' }}>
                  <a href="#" className="card-header" onClick={(event) => event.preventDefault()}>
                    <h5 className="mb-0">{groupName}</h5>
                  </a>
                  <div className="card-body">
                    {groupTasks.length === 0 && (
                      <div className="text-muted fs-12">No task found in this section.</div>
                    )}

                    <ul className="list-unstyled mb-0">
                      {groupTasks.map(task => (
                        <li className={`single-task-list px-3 py-2 mb-2 border border-dashed rounded-3 ${task.completed ? 'bg-soft-success border-success-subtle' : ''}`} key={task.id}>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3 me-3">
                              <div className="form-check m-0">
                                <input className="form-check-input" type="checkbox" checked={task.completed} onChange={() => toggleTaskDone(task.id)} />
                              </div>

                              <button type="button" className="btn btn-link p-0 lh-base" onClick={() => toggleTaskStar(task.id)}>
                                <i className={`${task.starred ? 'feather-star text-warning' : `feather-star ${task.completed ? 'text-success' : 'text-muted'}`}`}></i>
                              </button>

                              <a href="#" className="single-task-list-link" onClick={(event) => event.preventDefault()}>
                                <div className={`fs-13 fw-bold text-truncate-1-line ${task.completed ? 'text-decoration-line-through text-success' : ''}`}>
                                  {task.title}
                                  <span className={`ms-2 badge ${PRIORITY_BADGE[task.priority]}`}>{task.priority}</span>
                                </div>
                                <div className={`fs-12 fw-normal text-truncate-1-line ${task.completed ? 'text-success text-decoration-line-through' : 'text-muted'}`}>{task.description}</div>
                              </a>
                            </div>

                            <div className="d-flex flex-shrink-0 align-items-center gap-3">
                              <div className={`badge d-md-inline-block d-none ${CATEGORY_BADGE[task.category] || 'bg-soft-primary text-primary'}`}>{task.category}</div>
                              <div className={`d-md-inline-block d-none me-3 ${task.completed ? 'text-success' : ''}`}>{formatDate(task.dueDate)}</div>
                              <div className="avatar-image avatar-md d-sm-inline-block d-none">
                                <img src={task.assignee} alt="user" className="img-fluid" />
                              </div>
                              <div className="dropdown">
                                <button type="button" className="avatar-text avatar-md" data-bs-toggle="dropdown" aria-expanded="false">
                                  <i className="feather-more-vertical"></i>
                                </button>
                                <div className="dropdown-menu dropdown-menu-end">
                                  <button type="button" className="dropdown-item" onClick={() => openEditTaskModal(task)}>Edit Task</button>
                                  <button type="button" className="dropdown-item" onClick={() => openViewTaskModal(task)}>View Task</button>
                                  <button type="button" className="dropdown-item" onClick={() => deleteTask(task.id)}>Delete Task</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,.35)' }}>
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <form onSubmit={addTask}>
                <div className="modal-header">
                  <h5 className="modal-title">{isTaskViewMode ? 'View Task' : editingTaskId ? 'Edit Task' : 'Add New Task'}</h5>
                  <button type="button" className="btn-close" onClick={closeTaskModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-4">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Task Name"
                      value={newTaskForm.title}
                      disabled={isTaskViewMode}
                      onChange={(event) => setNewTaskForm(prev => ({ ...prev, title: event.target.value }))}
                    />
                    <small className="text-muted">Tasks name for your todo</small>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Note/Description</label>
                    <div className="border rounded">
                      <div className="d-flex align-items-center gap-3 px-3 py-2 border-bottom bg-light-subtle">
                        <select className="form-select form-select-sm" style={{ width: '90px' }} defaultValue="Normal">
                          <option>Normal</option>
                        </select>
                        <i className="feather-bold"></i>
                        <i className="feather-italic"></i>
                        <i className="feather-underline"></i>
                        <i className="feather-link"></i>
                        <i className="feather-list"></i>
                        <i className="feather-list"></i>
                        <i className="feather-type"></i>
                      </div>
                      <textarea
                        rows="5"
                        className="form-control border-0"
                        placeholder="Compose an epic... @mention, #tag"
                        value={newTaskForm.description}
                        disabled={isTaskViewMode}
                        onChange={(event) => setNewTaskForm(prev => ({ ...prev, description: event.target.value }))}
                      ></textarea>
                    </div>
                    <small className="text-muted">Note/Description max 200 charectars</small>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Date Range:</label>
                    <div className="input-group">
                      <input
                        type="date"
                        className="form-control"
                        value={newTaskForm.startDate}
                        disabled={isTaskViewMode}
                        onChange={(event) => setNewTaskForm(prev => ({ ...prev, startDate: event.target.value }))}
                      />
                      <span className="input-group-text">to</span>
                      <input
                        type="date"
                        className="form-control"
                        value={newTaskForm.endDate}
                        disabled={isTaskViewMode}
                        onChange={(event) => setNewTaskForm(prev => ({ ...prev, endDate: event.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Status:</label>
                    <select
                      className="form-select"
                      value={newTaskForm.status}
                      disabled={isTaskViewMode}
                      onChange={(event) => setNewTaskForm(prev => ({ ...prev, status: event.target.value }))}
                    >
                      <option value="Inprogress">Inprogress</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="New">New</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Priority:</label>
                    <select
                      className="form-select"
                      value={newTaskForm.priority}
                      disabled={isTaskViewMode}
                      onChange={(event) => setNewTaskForm(prev => ({ ...prev, priority: event.target.value }))}
                    >
                      <option value="Low">Low</option>
                      <option value="Normal">Normal</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="form-label">Assignee:</label>
                    <select
                      className="form-select"
                      value={newTaskForm.assignee}
                      disabled={isTaskViewMode}
                      onChange={(event) => setNewTaskForm(prev => ({ ...prev, assignee: event.target.value }))}
                    >
                      <option value="alex@outlook.com">alex@outlook.com</option>
                      <option value="john.deo@outlook.com">john.deo@outlook.com</option>
                      <option value="green.cutte@outlook.com">green.cutte@outlook.com</option>
                      <option value="nancy.elliot@outlook.com">nancy.elliot@outlook.com</option>
                      <option value="mar.audrey@gmail.com">mar.audrey@gmail.com</option>
                    </select>
                  </div>

                  <div className="mb-0">
                    <label className="form-label">Tags:</label>
                    <div className="form-control d-flex align-items-center gap-2 flex-wrap" style={{ minHeight: '44px' }}>
                      {tags.map(tag => {
                        const active = newTaskForm.tags.includes(tag)
                        return (
                          <button
                            key={tag}
                            type="button"
                            disabled={isTaskViewMode}
                            className={`badge ${active ? 'bg-soft-warning text-warning' : 'bg-soft-secondary text-secondary'} border-0 d-inline-flex align-items-center gap-1`}
                            onClick={() => toggleTaskTag(tag)}
                          >
                            <span className={`wd-6 ht-6 rounded-circle ${active ? 'bg-warning' : 'bg-secondary'}`}></span>
                            {tag}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-danger" onClick={closeTaskModal}>{isTaskViewMode ? 'Close' : 'Discard'}</button>
                  {!isTaskViewMode && (
                    <button type="submit" className="btn btn-primary">{editingTaskId ? 'Update Task' : 'Add Task'}</button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showCreateLabelModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,.35)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <form onSubmit={handleCreateLabel}>
                <div className="modal-header">
                  <h5 className="modal-title">Create Label</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowCreateLabelModal(false)
                      setNewLabelError('')
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <label className="form-label">Label name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Internal"
                    value={newLabelName}
                    onChange={(event) => {
                      setNewLabelName(event.target.value)
                      if (newLabelError) setNewLabelError('')
                    }}
                  />
                  {newLabelError && <small className="text-danger mt-2 d-inline-block">{newLabelError}</small>}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => {
                      setShowCreateLabelModal(false)
                      setNewLabelName('')
                      setNewLabelError('')
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Create Label</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showManageLabelsModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,.35)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Manages Label</h5>
                <button type="button" className="btn-close" onClick={() => setShowManageLabelsModal(false)}></button>
              </div>
              <div className="modal-body">
                {labels.length === 0 && <p className="text-muted mb-0">No labels available.</p>}
                {labels.map(label => {
                  const active = selectedLabels.includes(label)
                  return (
                    <div
                      key={label}
                      className={`d-flex align-items-center justify-content-between border rounded-2 px-3 py-2 mb-2 ${draggedLabel === label ? 'bg-light' : ''}`}
                      draggable
                      onDragStart={() => setDraggedLabel(label)}
                      onDragOver={(event) => {
                        event.preventDefault()
                      }}
                      onDrop={() => {
                        reorderLabels(draggedLabel, label)
                        setDraggedLabel(null)
                      }}
                      onDragEnd={() => setDraggedLabel(null)}
                    >
                      <div className="form-check m-0 d-flex align-items-center gap-2">
                        <i className="feather-menu text-muted" style={{ cursor: 'grab' }}></i>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleLabelSelection(label)}
                        />
                        <span>{label}</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-light"
                        onClick={() => handleDeleteLabel(label)}
                        disabled={labels.length === 1}
                        title={labels.length === 1 ? 'At least one label is required' : 'Delete label'}
                      >
                        <i className="feather-trash-2"></i>
                      </button>
                    </div>
                  )
                })}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setShowManageLabelsModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateTagModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,.35)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <form onSubmit={handleCreateTag}>
                <div className="modal-header">
                  <h5 className="modal-title">Create Tag</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowCreateTagModal(false)
                      setNewTagError('')
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <label className="form-label">Tag name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ex: Personal"
                    value={newTagName}
                    onChange={(event) => {
                      setNewTagName(event.target.value)
                      if (newTagError) setNewTagError('')
                    }}
                  />
                  {newTagError && <small className="text-danger mt-2 d-inline-block">{newTagError}</small>}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => {
                      setShowCreateTagModal(false)
                      setNewTagName('')
                      setNewTagError('')
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Create Tag</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showManageTagsModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ background: 'rgba(0,0,0,.35)' }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Manages Tag</h5>
                <button type="button" className="btn-close" onClick={() => setShowManageTagsModal(false)}></button>
              </div>
              <div className="modal-body">
                {tags.length === 0 && <p className="text-muted mb-0">No tags available.</p>}
                {tags.map(tag => {
                  const active = selectedTags.includes(tag)
                  return (
                    <div
                      key={tag}
                      className={`d-flex align-items-center justify-content-between border rounded-2 px-3 py-2 mb-2 ${draggedTag === tag ? 'bg-light' : ''}`}
                      draggable
                      onDragStart={() => setDraggedTag(tag)}
                      onDragOver={(event) => {
                        event.preventDefault()
                      }}
                      onDrop={() => {
                        reorderTags(draggedTag, tag)
                        setDraggedTag(null)
                      }}
                      onDragEnd={() => setDraggedTag(null)}
                    >
                      <div className="form-check m-0 d-flex align-items-center gap-2">
                        <i className="feather-menu text-muted" style={{ cursor: 'grab' }}></i>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleTagSelection(tag)}
                        />
                        <span>{tag}</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-light"
                        onClick={() => handleDeleteTag(tag)}
                        disabled={tags.length === 1}
                        title={tags.length === 1 ? 'At least one tag is required' : 'Delete tag'}
                      >
                        <i className="feather-trash-2"></i>
                      </button>
                    </div>
                  )
                })}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setShowManageTagsModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
