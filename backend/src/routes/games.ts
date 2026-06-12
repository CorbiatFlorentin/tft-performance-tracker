import { Router } from 'express'
import { getGames, getStats, getSummonerInfo } from '../controllers/gamesController'

const router = Router()

router.get('/', getGames)
router.get('/stats', getStats)
router.get('/summoner', getSummonerInfo)

export default router
