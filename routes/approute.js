import express from 'express';
import appcontroller from '../controller/appcontroller';

let router = express.Router();

router.route('/?').get(appcontroller.getResult);

module.exports = router;