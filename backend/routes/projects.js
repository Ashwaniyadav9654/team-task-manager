const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getProjects, getProject, createProject, updateProject,
  deleteProject, addMember, removeMember
} = require('../controllers/projectController');

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(adminOnly, createProject);

router.route('/:id')
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
