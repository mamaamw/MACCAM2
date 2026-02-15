import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

export default function Notes() {
  const [notes, setNotes] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [searchQuery, setSearchQuery] = useState('')
  const [filterColor, setFilterColor] = useState('all')
  const [filterFavorite, setFilterFavorite] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    color: 'primary',
    isFavorite: false,
    todos: [],
    images: [],
    documents: [],
    audios: [],
    drawings: []
  })
  
  const [newTodoText, setNewTodoText] = useState('')
  const [showDrawingModal, setShowDrawingModal] = useState(false)
  const [currentTab, setCurrentTab] = useState('content') // content, media, drawing
  
  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [showAudioPreview, setShowAudioPreview] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingIntervalRef = useRef(null)
  
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawColor, setDrawColor] = useState('#000000')
  const [drawWidth, setDrawWidth] = useState(3)
  const fileInputRef = useRef(null)
  const audioInputRef = useRef(null)
  const documentInputRef = useRef(null)

  const colors = [
    { value: 'primary', label: 'Bleu' },
    { value: 'success', label: 'Vert' },
    { value: 'warning', label: 'Jaune' },
    { value: 'danger', label: 'Rouge' },
    { value: 'info', label: 'Cyan' },
    { value: 'purple', label: 'Violet' },
    { value: 'teal', label: 'Sarcelle' },
    { value: 'indigo', label: 'Indigo' }
  ]

  // Load notes from localStorage on mount
  useEffect(() => {
    const storedNotes = localStorage.getItem('app_notes')
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes))
    } else {
      // Default notes
      const defaultNotes = [
        { 
          id: Date.now() + 1, 
          title: 'Réunion Client', 
          content: 'Discuter des besoins pour le nouveau projet CRM. Prévoir une démonstration des fonctionnalités principales et recueillir les feedbacks.', 
          color: 'primary', 
          date: new Date().toISOString(),
          isFavorite: false,
          todos: [],
          images: [],
          documents: [],
          audios: [],
          drawings: []
        },
        { 
          id: Date.now() + 2, 
          title: 'Idées Marketing', 
          content: 'Stratégie de contenu pour les réseaux sociaux:\n- LinkedIn: Articles techniques\n- Twitter: Actualités\n- Instagram: Visuels produits', 
          color: 'success', 
          date: new Date(Date.now() - 86400000).toISOString(),
          isFavorite: true,
          todos: [],
          images: [],
          documents: [],
          audios: [],
          drawings: []
        },
        { 
          id: Date.now() + 3, 
          title: 'Tâches de la semaine', 
          content: 'Liste des tâches importantes à accomplir cette semaine', 
          color: 'warning', 
          date: new Date(Date.now() - 172800000).toISOString(),
          isFavorite: false,
          todos: [
            { id: 1, text: 'Finir la présentation', completed: true },
            { id: 2, text: 'Envoyer les rapports', completed: true },
            { id: 3, text: 'Préparer la réunion', completed: false },
            { id: 4, text: 'Mettre à jour le site web', completed: false }
          ],
          images: [],
          documents: [],
          audios: [],
          drawings: []
        },
        { 
          id: Date.now() + 4, 
          title: 'Notes Technique', 
          content: 'Architecture du nouveau module:\n- API REST avec Node.js\n- Base de données MongoDB\n- Frontend React avec TypeScript\n- Tests unitaires avec Jest', 
          color: 'info', 
          date: new Date(Date.now() - 259200000).toISOString(),
          isFavorite: true,
          todos: [],
          images: [],
          documents: [],
          audios: [],
          drawings: []
        }
      ]
      setNotes(defaultNotes)
      localStorage.setItem('app_notes', JSON.stringify(defaultNotes))
    }
  }, [])

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('app_notes', JSON.stringify(notes))
    }
  }, [notes])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return "Aujourd'hui"
    if (days === 1) return 'Hier'
    if (days < 7) return `Il y a ${days} jours`
    
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const handleOpenModal = (note = null) => {
    if (note) {
      setEditingNote(note)
      setFormData({
        title: note.title,
        content: note.content,
        color: note.color,
        isFavorite: note.isFavorite,
        todos: note.todos || [],
        images: note.images || [],
        documents: note.documents || [],
        audios: note.audios || [],
        drawings: note.drawings || []
      })
    } else {
      setEditingNote(null)
      setFormData({
        title: '',
        content: '',
        color: 'primary',
        isFavorite: false,
        todos: [],
        images: [],
        documents: [],
        audios: [],
        drawings: []
      })
    }
    setNewTodoText('')
    setCurrentTab('content')
    setShowModal(true)
  }

  const handleCloseModal = () => {
    // Cancel any ongoing recording
    if (isRecording) {
      stopRecording()
    }
    
    setShowModal(false)
    setEditingNote(null)
    setFormData({
      title: '',
      content: '',
      color: 'primary',
      isFavorite: false,
      todos: [],
      images: [],
      documents: [],
      audios: [],
      drawings: []
    })
    setNewTodoText('')
    setCurrentTab('content')
    
    // Reset audio recording states
    setAudioBlob(null)
    setShowAudioPreview(false)
    setRecordingTime(0)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Le titre est requis')
      return
    }

    if (editingNote) {
      // Update existing note
      setNotes(notes.map(note => 
        note.id === editingNote.id 
          ? { ...note, ...formData, date: note.date }
          : note
      ))
      toast.success('Note mise à jour avec succès')
    } else {
      // Create new note
      const newNote = {
        id: Date.now(),
        ...formData,
        date: new Date().toISOString()
      }
      setNotes([newNote, ...notes])
      toast.success('Note créée avec succès')
    }

    handleCloseModal()
  }

  const handleDelete = (noteId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      setNotes(notes.filter(note => note.id !== noteId))
      toast.success('Note supprimée')
    }
  }

  const handleToggleFavorite = (noteId) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, isFavorite: !note.isFavorite }
        : note
    ))
  }

  const handleDuplicate = (note) => {
    const duplicatedNote = {
      ...note,
      id: Date.now(),
      title: `${note.title} (Copie)`,
      date: new Date().toISOString()
    }
    setNotes([duplicatedNote, ...notes])
    toast.success('Note dupliquée')
  }

  // TODO Management Functions
  const handleAddTodo = () => {
    if (!newTodoText.trim()) return
    
    const newTodo = {
      id: Date.now(),
      text: newTodoText.trim(),
      completed: false
    }
    
    setFormData({
      ...formData,
      todos: [...formData.todos, newTodo]
    })
    setNewTodoText('')
  }

  const handleToggleTodoInForm = (todoId) => {
    setFormData({
      ...formData,
      todos: formData.todos.map(todo =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      )
    })
  }

  const handleRemoveTodo = (todoId) => {
    setFormData({
      ...formData,
      todos: formData.todos.filter(todo => todo.id !== todoId)
    })
  }

  const handleToggleTodoInNote = (noteId, todoId) => {
    setNotes(notes.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          todos: note.todos.map(todo =>
            todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
          )
        }
      }
      return note
    }))
  }

  const getTodoProgress = (todos) => {
    if (!todos || todos.length === 0) return null
    const completed = todos.filter(t => t.completed).length
    const total = todos.length
    const percentage = Math.round((completed / total) * 100)
    return { completed, total, percentage }
  }

  // Media Management Functions
  const handleFileUpload = (files, type) => {
    if (!files || files.length === 0) return

    Array.from(files).forEach(file => {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Le fichier ${file.name} est trop volumineux (max 5MB)`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const mediaItem = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: e.target.result,
          uploadDate: new Date().toISOString()
        }

        if (type === 'image') {
          setFormData({
            ...formData,
            images: [...formData.images, mediaItem]
          })
        } else if (type === 'document') {
          setFormData({
            ...formData,
            documents: [...formData.documents, mediaItem]
          })
        } else if (type === 'audio') {
          setFormData({
            ...formData,
            audios: [...formData.audios, mediaItem]
          })
        }
        
        toast.success(`${file.name} ajouté`)
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveMedia = (mediaId, mediaType) => {
    if (mediaType === 'image') {
      setFormData({
        ...formData,
        images: formData.images.filter(img => img.id !== mediaId)
      })
    } else if (mediaType === 'document') {
      setFormData({
        ...formData,
        documents: formData.documents.filter(doc => doc.id !== mediaId)
      })
    } else if (mediaType === 'audio') {
      setFormData({
        ...formData,
        audios: formData.audios.filter(audio => audio.id !== mediaId)
      })
    } else if (mediaType === 'drawing') {
      setFormData({
        ...formData,
        drawings: formData.drawings.filter(draw => draw.id !== mediaId)
      })
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Audio Recording Functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        setShowAudioPreview(true)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      toast.success('Enregistrement démarré')
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast.error('Impossible d\'accéder au microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }

  const cancelRecording = () => {
    if (isRecording) {
      stopRecording()
    }
    setAudioBlob(null)
    setShowAudioPreview(false)
    setRecordingTime(0)
  }

  const saveRecordedAudio = () => {
    if (!audioBlob) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const audioItem = {
        id: Date.now(),
        name: `Enregistrement ${new Date().toLocaleString('fr-FR')}`,
        type: 'audio/webm',
        size: audioBlob.size,
        data: e.target.result,
        uploadDate: new Date().toISOString(),
        isRecorded: true
      }

      setFormData({
        ...formData,
        audios: [...formData.audios, audioItem]
      })

      toast.success('Enregistrement ajouté')
      cancelRecording()
    }
    reader.readAsDataURL(audioBlob)
  }

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [])

  // Drawing Functions
  const initCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  const startDrawing = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = drawColor
    ctx.lineWidth = drawWidth
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const saveDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const drawingData = canvas.toDataURL('image/png')
    const drawing = {
      id: Date.now(),
      data: drawingData,
      date: new Date().toISOString()
    }

    setFormData({
      ...formData,
      drawings: [...formData.drawings, drawing]
    })

    toast.success('Dessin ajouté')
    setShowDrawingModal(false)
    clearCanvas()
  }

  useEffect(() => {
    if (showDrawingModal) {
      initCanvas()
    }
  }, [showDrawingModal])

  // Filter notes based on search, color, and favorite
  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesColor = filterColor === 'all' || note.color === filterColor
    const matchesFavorite = !filterFavorite || note.isFavorite
    
    return matchesSearch && matchesColor && matchesFavorite
  })

  return (
    <>
      {/* [ Main Content ] start */}
      <div className="main-content">
        <div className="row">
          <div className="col-lg-12">
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
              <div>
                <h4 className="mb-1">Notes</h4>
                <p className="mb-0 text-muted">Gérez vos notes et idées ({filteredNotes.length} note{filteredNotes.length > 1 ? 's' : ''})</p>
              </div>
              <div className="d-flex gap-2">
                <button 
                  className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => setViewMode('grid')}
                  title="Vue grille"
                >
                  <i className="feather-grid"></i>
                </button>
                <button 
                  className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-light'}`}
                  onClick={() => setViewMode('list')}
                  title="Vue liste"
                >
                  <i className="feather-list"></i>
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleOpenModal()}
                >
                  <i className="feather-plus me-2"></i>
                  Nouvelle Note
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="row g-3 align-items-center">
                  <div className="col-md-4">
                    <div className="input-group">
                      <span className="input-group-text"><i className="feather-search"></i></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Rechercher des notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <select 
                      className="form-select"
                      value={filterColor}
                      onChange={(e) => setFilterColor(e.target.value)}
                    >
                      <option value="all">Toutes les couleurs</option>
                      {colors.map(color => (
                        <option key={color.value} value={color.value}>{color.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="filterFavorites"
                        checked={filterFavorite}
                        onChange={(e) => setFilterFavorite(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="filterFavorites">
                        Favoris uniquement
                      </label>
                    </div>
                  </div>
                  <div className="col-md-2 text-end">
                    {(searchQuery || filterColor !== 'all' || filterFavorite) && (
                      <button
                        className="btn btn-sm btn-light"
                        onClick={() => {
                          setSearchQuery('')
                          setFilterColor('all')
                          setFilterFavorite(false)
                        }}
                      >
                        <i className="feather-x me-1"></i>
                        Réinitialiser
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Grid/List */}
        {filteredNotes.length === 0 ? (
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body text-center py-5">
                  <i className="feather-file-text" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                  <h5 className="mt-3 text-muted">Aucune note trouvée</h5>
                  <p className="text-muted mb-4">
                    {searchQuery || filterColor !== 'all' || filterFavorite
                      ? 'Essayez de modifier vos filtres'
                      : 'Commencez par créer votre première note'}
                  </p>
                  {!searchQuery && filterColor === 'all' && !filterFavorite && (
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                      <i className="feather-plus me-2"></i>
                      Créer une note
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row">
            {filteredNotes.map((note) => (
              <div 
                key={note.id} 
                className={viewMode === 'grid' ? 'col-lg-3 col-md-6 mb-4' : 'col-12 mb-3'}
              >
                <div className={`card stretch stretch-full ${note.isFavorite ? 'border-primary' : ''}`}>
                  <div className={`card-header bg-soft-${note.color} border-bottom-0`}>
                    <div className="d-flex align-items-start justify-content-between">
                      <h6 className={`card-title text-${note.color} mb-0 flex-grow-1`}>
                        {note.isFavorite && <i className="feather-star me-2 text-warning fs-12"></i>}
                        {note.title}
                      </h6>
                      <div className="dropdown">
                        <a 
                          href="#" 
                          onClick={(e) => e.preventDefault()} 
                          data-bs-toggle="dropdown" 
                          className={`avatar-text avatar-sm text-${note.color}`}
                        >
                          <i className="feather-more-vertical"></i>
                        </a>
                        <ul className="dropdown-menu dropdown-menu-end">
                          <li>
                            <a 
                              className="dropdown-item" 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault()
                                handleOpenModal(note)
                              }}
                            >
                              <i className="feather-edit-3 me-2"></i>Modifier
                            </a>
                          </li>
                          <li>
                            <a 
                              className="dropdown-item" 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault()
                                handleDuplicate(note)
                              }}
                            >
                              <i className="feather-copy me-2"></i>Dupliquer
                            </a>
                          </li>
                          <li>
                            <a 
                              className="dropdown-item" 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault()
                                handleToggleFavorite(note.id)
                              }}
                            >
                              <i className={`feather-star me-2 ${note.isFavorite ? 'text-warning' : ''}`}></i>
                              {note.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                            </a>
                          </li>
                          <li><hr className="dropdown-divider" /></li>
                          <li>
                            <a 
                              className="dropdown-item text-danger" 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault()
                                handleDelete(note.id)
                              }}
                            >
                              <i className="feather-trash-2 me-2"></i>Supprimer
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    {note.content && (
                      <p 
                        className="card-text text-muted mb-3" 
                        style={{ 
                          whiteSpace: 'pre-line',
                          maxHeight: viewMode === 'grid' ? '100px' : 'none',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {note.content}
                      </p>
                    )}
                    
                    {/* TODOs List */}
                    {note.todos && note.todos.length > 0 && (
                      <div className="mb-3">
                        {getTodoProgress(note.todos) && (
                          <div className="mb-2">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small className="text-muted">
                                <i className="feather-check-circle me-1"></i>
                                {getTodoProgress(note.todos).completed}/{getTodoProgress(note.todos).total} tâches
                              </small>
                              <small className="text-muted">{getTodoProgress(note.todos).percentage}%</small>
                            </div>
                            <div className="progress" style={{ height: '4px' }}>
                              <div 
                                className={`progress-bar bg-${note.color}`}
                                style={{ width: `${getTodoProgress(note.todos).percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        <div className="todo-list" style={{ maxHeight: viewMode === 'grid' ? '120px' : '200px', overflowY: 'auto' }}>
                          {note.todos.slice(0, viewMode === 'grid' ? 3 : 10).map((todo) => (
                            <div key={todo.id} className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => handleToggleTodoInNote(note.id, todo.id)}
                                id={`todo-${note.id}-${todo.id}`}
                              />
                              <label
                                className={`form-check-label ${todo.completed ? 'text-decoration-line-through text-muted' : ''}`}
                                htmlFor={`todo-${note.id}-${todo.id}`}
                                style={{ fontSize: '0.875rem', cursor: 'pointer' }}
                              >
                                {todo.text}
                              </label>
                            </div>
                          ))}
                          {viewMode === 'grid' && note.todos.length > 3 && (
                            <small className="text-muted">
                              +{note.todos.length - 3} autre{note.todos.length - 3 > 1 ? 's' : ''}...
                            </small>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Media Preview */}
                    {((note.images && note.images.length > 0) || 
                      (note.documents && note.documents.length > 0) || 
                      (note.audios && note.audios.length > 0) || 
                      (note.drawings && note.drawings.length > 0)) && (
                      <div className="mb-3">
                        <div className="d-flex gap-2 flex-wrap">
                          {note.images && note.images.length > 0 && (
                            <span className="badge bg-primary">
                              <i className="feather-image me-1"></i>
                              {note.images.length} photo{note.images.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {note.documents && note.documents.length > 0 && (
                            <span className="badge bg-info">
                              <i className="feather-file me-1"></i>
                              {note.documents.length} doc{note.documents.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {note.audios && note.audios.length > 0 && (
                            <span className="badge bg-success">
                              <i className="feather-mic me-1"></i>
                              {note.audios.length} audio{note.audios.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {note.drawings && note.drawings.length > 0 && (
                            <span className="badge bg-warning">
                              <i className="feather-edit-2 me-1"></i>
                              {note.drawings.length} dessin{note.drawings.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        {viewMode === 'list' && note.images && note.images.length > 0 && (
                          <div className="d-flex gap-2 mt-2" style={{ overflowX: 'auto' }}>
                            {note.images.slice(0, 4).map((img) => (
                              <img
                                key={img.id}
                                src={img.data}
                                alt={img.name}
                                style={{
                                  width: '80px',
                                  height: '80px',
                                  objectFit: 'cover',
                                  borderRadius: '4px'
                                }}
                              />
                            ))}
                            {note.images.length > 4 && (
                              <div
                                className="d-flex align-items-center justify-content-center bg-light"
                                style={{
                                  width: '80px',
                                  height: '80px',
                                  borderRadius: '4px',
                                  fontSize: '0.875rem'
                                }}
                              >
                                +{note.images.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="fs-11 text-muted">
                        <i className="feather-clock me-1"></i>
                        {formatDate(note.date)}
                      </span>
                      <div className="hstack gap-2">
                        <a 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault()
                            handleOpenModal(note)
                          }} 
                          className="avatar-text avatar-xs"
                          title="Modifier"
                        >
                          <i className="feather-edit-3"></i>
                        </a>
                        <a 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault()
                            handleToggleFavorite(note.id)
                          }} 
                          className={`avatar-text avatar-xs ${note.isFavorite ? 'text-warning' : ''}`}
                          title={note.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        >
                          <i className={note.isFavorite ? 'feather-star' : 'feather-star'}></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add New Note Card */}
            {viewMode === 'grid' && (
              <div className="col-lg-3 col-md-6 mb-4">
                <div 
                  className="card stretch stretch-full border-dashed-2 border-gray-5 bg-gray-100"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleOpenModal()}
                >
                  <div className="card-body d-flex align-items-center justify-content-center" style={{minHeight: '250px'}}>
                    <div className="text-center">
                      <i className="feather-plus-circle text-muted" style={{fontSize: '3rem', opacity: 0.5}}></i>
                      <h6 className="mt-3 text-muted">Ajouter une Note</h6>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* [ Main Content ] end */}

      {/* Create/Edit Note Modal */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingNote ? 'Modifier la note' : 'Nouvelle note'}
                  </h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {/* Tabs Navigation */}
                    <ul className="nav nav-tabs mb-3" role="tablist">
                      <li className="nav-item">
                        <button
                          type="button"
                          className={`nav-link ${currentTab === 'content' ? 'active' : ''}`}
                          onClick={() => setCurrentTab('content')}
                        >
                          <i className="feather-file-text me-2"></i>
                          Contenu
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          type="button"
                          className={`nav-link ${currentTab === 'media' ? 'active' : ''}`}
                          onClick={() => setCurrentTab('media')}
                        >
                          <i className="feather-image me-2"></i>
                          Médias
                          {(formData.images.length + formData.documents.length + formData.audios.length) > 0 && (
                            <span className="badge bg-primary ms-1">
                              {formData.images.length + formData.documents.length + formData.audios.length}
                            </span>
                          )}
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          type="button"
                          className={`nav-link ${currentTab === 'drawing' ? 'active' : ''}`}
                          onClick={() => setCurrentTab('drawing')}
                        >
                          <i className="feather-edit me-2"></i>
                          Dessins
                          {formData.drawings.length > 0 && (
                            <span className="badge bg-primary ms-1">{formData.drawings.length}</span>
                          )}
                        </button>
                      </li>
                    </ul>

                    {/* Tab Content */}
                    <div className="tab-content">
                      {/* Content Tab */}
                      {currentTab === 'content' && (
                        <div>
                          <div className="mb-3">
                            <label className="form-label">Titre <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              className="form-control"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              placeholder="Titre de la note"
                              required
                            />
                          </div>
                          
                          <div className="mb-3">
                            <label className="form-label">Contenu</label>
                            <textarea
                              className="form-control"
                              rows="5"
                              value={formData.content}
                              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                              placeholder="Écrivez votre note ici..."
                            ></textarea>
                          </div>

                          {/* TODOs Section */}
                          <div className="mb-3">
                            <label className="form-label">
                              <i className="feather-check-square me-1"></i>
                              Liste de tâches (TODO)
                            </label>
                            <div className="input-group mb-2">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Ajouter une tâche..."
                                value={newTodoText}
                                onChange={(e) => setNewTodoText(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleAddTodo()
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleAddTodo}
                              >
                                <i className="feather-plus"></i>
                              </button>
                            </div>
                            {formData.todos && formData.todos.length > 0 && (
                              <div className="border rounded p-3" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {formData.todos.map((todo) => (
                                  <div key={todo.id} className="d-flex align-items-center justify-content-between mb-2">
                                    <div className="form-check flex-grow-1">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={todo.completed}
                                        onChange={() => handleToggleTodoInForm(todo.id)}
                                        id={`form-todo-${todo.id}`}
                                      />
                                      <label
                                        className={`form-check-label ${todo.completed ? 'text-decoration-line-through text-muted' : ''}`}
                                        htmlFor={`form-todo-${todo.id}`}
                                        style={{ cursor: 'pointer' }}
                                      >
                                        {todo.text}
                                      </label>
                                    </div>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-text-danger"
                                      onClick={() => handleRemoveTodo(todo.id)}
                                      title="Supprimer"
                                    >
                                      <i className="feather-x"></i>
                                    </button>
                                  </div>
                                ))}
                                {getTodoProgress(formData.todos) && (
                                  <div className="mt-2 pt-2 border-top">
                                    <small className="text-muted">
                                      <i className="feather-check-circle me-1"></i>
                                      {getTodoProgress(formData.todos).completed}/{getTodoProgress(formData.todos).total} tâches complétées ({getTodoProgress(formData.todos).percentage}%)
                                    </small>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="row">
                            <div className="col-md-6">
                              <label className="form-label">Couleur</label>
                              <div className="d-flex flex-wrap gap-2">
                                {colors.map(color => (
                                  <button
                                    key={color.value}
                                    type="button"
                                    className={`btn btn-${color.value} ${formData.color === color.value ? 'active' : 'btn-soft-' + color.value}`}
                                    onClick={() => setFormData({ ...formData, color: color.value })}
                                    style={{ width: '45px', height: '45px', padding: 0 }}
                                    title={color.label}
                                  >
                                    {formData.color === color.value && <i className="feather-check"></i>}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Options</label>
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="noteFavorite"
                                  checked={formData.isFavorite}
                                  onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                                />
                                <label className="form-check-label" htmlFor="noteFavorite">
                                  <i className="feather-star text-warning me-1"></i>
                                  Marquer comme favori
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Media Tab */}
                      {currentTab === 'media' && (
                        <div>
                          {/* Images */}
                          <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <label className="form-label mb-0">
                                <i className="feather-image me-2"></i>
                                Photos ({formData.images.length})
                              </label>
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                <i className="feather-upload me-2"></i>
                                Ajouter des photos
                              </button>
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileUpload(e.target.files, 'image')}
                              />
                            </div>
                            {formData.images.length > 0 ? (
                              <div className="row g-3">
                                {formData.images.map((img) => (
                                  <div key={img.id} className="col-md-3">
                                    <div className="card">
                                      <img src={img.data} className="card-img-top" alt={img.name} style={{ height: '150px', objectFit: 'cover' }} />
                                      <div className="card-body p-2">
                                        <small className="text-muted d-block text-truncate">{img.name}</small>
                                        <small className="text-muted">{formatFileSize(img.size)}</small>
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-text-danger w-100 mt-2"
                                          onClick={() => handleRemoveMedia(img.id, 'image')}
                                        >
                                          <i className="feather-trash-2"></i>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 border rounded bg-light">
                                <i className="feather-image text-muted" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                                <p className="text-muted mt-2 mb-0">Aucune photo ajoutée</p>
                              </div>
                            )}
                          </div>

                          {/* Documents */}
                          <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <label className="form-label mb-0">
                                <i className="feather-file me-2"></i>
                                Documents ({formData.documents.length})
                              </label>
                              <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={() => documentInputRef.current?.click()}
                              >
                                <i className="feather-upload me-2"></i>
                                Ajouter des documents
                              </button>
                              <input
                                ref={documentInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
                                multiple
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileUpload(e.target.files, 'document')}
                              />
                            </div>
                            {formData.documents.length > 0 ? (
                              <div className="list-group">
                                {formData.documents.map((doc) => (
                                  <div key={doc.id} className="list-group-item">
                                    <div className="d-flex justify-content-between align-items-center">
                                      <div className="d-flex align-items-center">
                                        <i className="feather-file me-3 text-primary" style={{ fontSize: '1.5rem' }}></i>
                                        <div>
                                          <div className="fw-medium">{doc.name}</div>
                                          <small className="text-muted">{formatFileSize(doc.size)}</small>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-text-danger"
                                        onClick={() => handleRemoveMedia(doc.id, 'document')}
                                      >
                                        <i className="feather-trash-2"></i>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 border rounded bg-light">
                                <i className="feather-file text-muted" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                                <p className="text-muted mt-2 mb-0">Aucun document ajouté</p>
                              </div>
                            )}
                          </div>

                          {/* Audio Files */}
                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <label className="form-label mb-0">
                                <i className="feather-mic me-2"></i>
                                Fichiers audio ({formData.audios.length})
                              </label>
                              <div className="d-flex gap-2">
                                {!isRecording && !showAudioPreview && (
                                  <>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-danger"
                                      onClick={startRecording}
                                    >
                                      <i className="feather-mic me-2"></i>
                                      S'enregistrer
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-primary"
                                      onClick={() => audioInputRef.current?.click()}
                                    >
                                      <i className="feather-upload me-2"></i>
                                      Importer
                                    </button>
                                  </>
                                )}
                              </div>
                              <input
                                ref={audioInputRef}
                                type="file"
                                accept="audio/*"
                                multiple
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileUpload(e.target.files, 'audio')}
                              />
                            </div>

                            {/* Recording Interface */}
                            {isRecording && (
                              <div className="card bg-danger bg-gradient text-white mb-3">
                                <div className="card-body">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                      <div className="spinner-grow spinner-grow-sm me-3" role="status">
                                        <span className="visually-hidden">Recording...</span>
                                      </div>
                                      <div>
                                        <h6 className="mb-0">Enregistrement en cours...</h6>
                                        <div className="fs-4 fw-bold mt-2">{formatRecordingTime(recordingTime)}</div>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      className="btn btn-light"
                                      onClick={stopRecording}
                                    >
                                      <i className="feather-square me-2"></i>
                                      Arrêter
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Audio Preview */}
                            {showAudioPreview && audioBlob && (
                              <div className="card mb-3 border-success">
                                <div className="card-body">
                                  <h6 className="card-title">
                                    <i className="feather-headphones me-2 text-success"></i>
                                    Prévisualisation de l'enregistrement
                                  </h6>
                                  <audio controls className="w-100 mb-3" style={{ height: '40px' }}>
                                    <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
                                  </audio>
                                  <div className="d-flex gap-2">
                                    <button
                                      type="button"
                                      className="btn btn-success flex-grow-1"
                                      onClick={saveRecordedAudio}
                                    >
                                      <i className="feather-check me-2"></i>
                                      Enregistrer
                                    </button>
                                    <button
                                      type="button"
                                      className="btn btn-light"
                                      onClick={cancelRecording}
                                    >
                                      <i className="feather-x me-2"></i>
                                      Annuler
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Audio List */}
                            {formData.audios.length > 0 ? (
                              <div className="list-group">
                                {formData.audios.map((audio) => (
                                  <div key={audio.id} className="list-group-item">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <div className="d-flex align-items-center flex-grow-1">
                                        <i className={`feather-${audio.isRecorded ? 'mic' : 'music'} me-3 text-success`} style={{ fontSize: '1.5rem' }}></i>
                                        <div className="flex-grow-1">
                                          <div className="fw-medium">
                                            {audio.name}
                                            {audio.isRecorded && (
                                              <span className="badge bg-danger ms-2">
                                                <i className="feather-mic" style={{ fontSize: '0.7rem' }}></i>
                                              </span>
                                            )}
                                          </div>
                                          <small className="text-muted">{formatFileSize(audio.size)}</small>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-text-danger"
                                        onClick={() => handleRemoveMedia(audio.id, 'audio')}
                                      >
                                        <i className="feather-trash-2"></i>
                                      </button>
                                    </div>
                                    <audio controls className="w-100" style={{ height: '40px' }}>
                                      <source src={audio.data} type={audio.type} />
                                    </audio>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              !isRecording && !showAudioPreview && (
                                <div className="text-center py-4 border rounded bg-light">
                                  <i className="feather-mic text-muted" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                                  <p className="text-muted mt-2 mb-0">Aucun fichier audio ajouté</p>
                                  <p className="text-muted small">Enregistrez-vous ou importez un fichier audio</p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Drawing Tab */}
                      {currentTab === 'drawing' && (
                        <div>
                          <div className="mb-3">
                            <button
                              type="button"
                              className="btn btn-primary w-100"
                              onClick={() => setShowDrawingModal(true)}
                            >
                              <i className="feather-edit-2 me-2"></i>
                              Créer un nouveau dessin
                            </button>
                          </div>

                          {formData.drawings.length > 0 ? (
                            <div className="row g-3">
                              {formData.drawings.map((drawing) => (
                                <div key={drawing.id} className="col-md-4">
                                  <div className="card">
                                    <img src={drawing.data} className="card-img-top" alt="Dessin" />
                                    <div className="card-body p-2">
                                      <small className="text-muted d-block">
                                        {new Date(drawing.date).toLocaleDateString('fr-FR')}
                                      </small>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-text-danger w-100 mt-2"
                                        onClick={() => handleRemoveMedia(drawing.id, 'drawing')}
                                      >
                                        <i className="feather-trash-2"></i> Supprimer
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-5 border rounded bg-light">
                              <i className="feather-edit-2 text-muted" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                              <p className="text-muted mt-2 mb-0">Aucun dessin créé</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-light" onClick={handleCloseModal}>
                      Annuler
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <i className="feather-save me-2"></i>
                      {editingNote ? 'Mettre à jour' : 'Créer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Drawing Modal */}
      {showDrawingModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="feather-edit-2 me-2"></i>
                  Créer un dessin
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowDrawingModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <div className="btn-group mb-3" role="group">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-dark"
                      onClick={clearCanvas}
                    >
                      <i className="feather-trash-2 me-1"></i>
                      Effacer tout
                    </button>
                  </div>
                  <div className="d-flex gap-3 mb-3">
                    <div>
                      <label className="form-label mb-1">Couleur</label>
                      <input
                        type="color"
                        className="form-control form-control-color"
                        value={drawColor}
                        onChange={(e) => setDrawColor(e.target.value)}
                        style={{ width: '60px', height: '40px' }}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <label className="form-label mb-1">Épaisseur: {drawWidth}px</label>
                      <input
                        type="range"
                        className="form-range"
                        min="1"
                        max="20"
                        value={drawWidth}
                        onChange={(e) => setDrawWidth(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
                <div className="border rounded bg-white" style={{ cursor: 'crosshair' }}>
                  <canvas
                    ref={canvasRef}
                    width={1000}
                    height={600}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      const touch = e.touches[0]
                      const mouseEvent = new MouseEvent('mousedown', {
                        clientX: touch.clientX,
                        clientY: touch.clientY
                      })
                      startDrawing(mouseEvent)
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault()
                      const touch = e.touches[0]
                      const mouseEvent = new MouseEvent('mousemove', {
                        clientX: touch.clientX,
                        clientY: touch.clientY
                      })
                      draw(mouseEvent)
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault()
                      stopDrawing()
                    }}
                    style={{ display: 'block', width: '100%', touchAction: 'none' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setShowDrawingModal(false)}>
                  Annuler
                </button>
                <button type="button" className="btn btn-primary" onClick={saveDrawing}>
                  <i className="feather-save me-2"></i>
                  Enregistrer le dessin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
