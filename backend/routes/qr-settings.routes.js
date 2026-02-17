import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Simple file-based storage for demo
const SAVE_PATH = path.join(__dirname, '../data/qr-settings.json')

router.post('/save', (req, res) => {
  try {
    const settings = req.body
    fs.writeFileSync(SAVE_PATH, JSON.stringify(settings, null, 2))
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur sauvegarde', error: err.message })
  }
})

router.get('/load', (req, res) => {
  try {
    if (!fs.existsSync(SAVE_PATH)) {
      return res.json({ settings: null })
    }
    const settings = JSON.parse(fs.readFileSync(SAVE_PATH, 'utf8'))
    res.json({ settings })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur chargement', error: err.message })
  }
})

export default router
