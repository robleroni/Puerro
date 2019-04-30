import { FormController } from './controllers/form.js';
import { ListController } from './controllers/list.js';

import { getInitialFormState } from './models/form.js';
import { getInitialListState } from './models/list.js';

import { formView } from './views/form.js';
import { listView } from './views/list.js';

const $formRoot = document.getElementById('vegetable-input');
const $listRoot = document.getElementById('vegetable-output');

const formController = new FormController($formRoot, getInitialFormState(), formView);
const listController = new ListController($listRoot, getInitialListState(), listView, false);

formController.addSaveListener(vegetable => listController.updateVegetable(vegetable));
listController.addSelectionChangeListener(vegetable => formController.setVegetable(vegetable));