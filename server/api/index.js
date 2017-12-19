import { Router } from 'express'

import screenshot from './screenshot'

const router = Router()

// Add screenshot Routes
router.use(screenshot)

export default router
