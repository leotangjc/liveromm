const express = require('express');
const router = express.Router();

/**
 * @swagger
 * /create/user:
 *   post:
 *     summary: 新增用户
 *     description: create user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: _workspaceId
 *         description: 工作空间编号
 *         in: query
 *         description: 输入类型
 *         required: true
 *         type: String
 *       - name: page
 *         description: 页数
 *         in: formData
 *         required: false
 *         type: Number
 *       - name: limit
 *         description: 限制
 *         in: formData
 *         required: false
 *         type: Number
 *       - name: dataType
 *         description: 数据类型
 *         in: formData
 *         required: true
 *         type: String
 *     responses:
 *       200:
 *
 */
router.post('/', (req, res) => {
  let userModel = {
    name: 'cute-body',
    password: 'ctf'
  }
  let user = new db.User(userModel)
  user
.save()
.then(result => res.send(result));
.catch(err => res.send(500, err));
});

module.exports = router;
