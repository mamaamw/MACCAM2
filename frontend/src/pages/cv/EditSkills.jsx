import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function EditSkills() {
  const navigate = useNavigate()
  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('cv_skills')
    if (saved) {
      setSkills(JSON.parse(saved))
    } else {
      setSkills([
        { category: 'Frontend', items: ['React', 'Vue.js', 'TypeScript', 'Tailwind CSS', 'Bootstrap'] },
        { category: 'Backend', items: ['Node.js', 'Express', 'NestJS', 'Python', 'Django'] },
        { category: 'Database', items: ['PostgreSQL', 'MongoDB', 'Redis', 'Prisma'] },
        { category: 'DevOps', items: ['Docker', 'AWS', 'CI/CD', 'GitHub Actions'] }
      ])
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('cv_skills', JSON.stringify(skills))
    toast.success('Compétences enregistrées')
    navigate('/cv')
  }

  const handleAddCategory = () => {
    const name = prompt('Nom de la catégorie :')
    if (name) {
      setSkills([...skills, { category: name, items: [] }])
    }
  }

  const handleDeleteCategory = (index) => {
    if (confirm('Supprimer cette catégorie ?')) {
      setSkills(skills.filter((_, i) => i !== index))
    }
  }

  const handleAddSkill = (categoryIndex, skill) => {
    if (skill.trim()) {
      const newSkills = [...skills]
      newSkills[categoryIndex].items.push(skill.trim())
      setSkills(newSkills)
    }
  }

  const handleDeleteSkill = (categoryIndex, skillIndex) => {
    const newSkills = [...skills]
    newSkills[categoryIndex].items.splice(skillIndex, 1)
    setSkills(newSkills)
  }

  const handleRenameCategory = (index, newName) => {
    const newSkills = [...skills]
    newSkills[index].category = newName
    setSkills(newSkills)
  }

  return (
    <div className="main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Modifier les compétences</h4>
          <p className="text-muted mb-0">Organisez vos compétences par catégories</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-light" onClick={() => navigate('/cv')}>
            Annuler
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            <i className="feather-check me-2"></i>
            Enregistrer
          </button>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <button className="btn btn-primary w-100" onClick={handleAddCategory}>
            <i className="feather-plus me-2"></i>
            Ajouter une catégorie
          </button>
        </div>
      </div>

      {skills.map((skillGroup, catIndex) => (
        <div key={catIndex} className="card mb-3">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <input
                type="text"
                className="form-control form-control-sm w-auto border-0 fw-bold"
                value={skillGroup.category}
                onChange={(e) => handleRenameCategory(catIndex, e.target.value)}
                style={{ fontSize: '1rem' }}
              />
              <button 
                className="btn btn-sm btn-danger"
                onClick={() => handleDeleteCategory(catIndex)}
              >
                <i className="feather-trash-2"></i>
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ajouter une compétence"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSkill(catIndex, e.target.value)
                      e.target.value = ''
                    }
                  }}
                />
                <button
                  className="btn btn-primary"
                  onClick={(e) => {
                    const input = e.target.previousSibling
                    handleAddSkill(catIndex, input.value)
                    input.value = ''
                  }}
                >
                  Ajouter
                </button>
              </div>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {skillGroup.items.map((skill, skillIndex) => (
                <span key={skillIndex} className="badge bg-soft-primary text-primary fs-6 p-2">
                  {skill}
                  <button
                    type="button"
                    className="btn-close btn-close-sm ms-2"
                    style={{ fontSize: '10px' }}
                    onClick={() => handleDeleteSkill(catIndex, skillIndex)}
                  ></button>
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="d-flex justify-content-end gap-2 mt-4">
        <button className="btn btn-light" onClick={() => navigate('/cv')}>
          Annuler
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          <i className="feather-check me-2"></i>
          Enregistrer
        </button>
      </div>
    </div>
  )
}
