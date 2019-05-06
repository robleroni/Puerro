import { FormController } from './controllers/form.js';
import { ListController } from './controllers/list.js';

import { formModel } from './models/form.js';
import { listModel } from './models/list.js';

import { formView } from './views/form.js';
import { listView } from './views/list.js';

const $formRoot = document.getElementById('vegetable-input');
const $listRoot = document.getElementById('vegetable-output');

const formController = new FormController($formRoot, formModel, formView);
const listController = new ListController($listRoot, listModel, listView, false);

formController.eventManager.subscribe('save', vegetable => listController.updateVegetable(vegetable));
listController.eventManager.subscribe('selectionChanged', vegetable => formController.setVegetable(vegetable)); 