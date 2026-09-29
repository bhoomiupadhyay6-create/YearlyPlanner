const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');

router.post('/', goalController.createGoal);
router.get('/', goalController.getAllGoals);
router.get('/:id', goalController.getGoalById);
router.patch('/:id', goalController.updateGoal);
router.put('/:id', goalController.updateGoal);
router.patch('/:id/progress', goalController.updateGoalProgress);
router.delete('/:id', goalController.deleteGoal);

module.exports = router;