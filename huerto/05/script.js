import { PuerroController } from '../../src/mvc/controller.js';
import { FormController } from './controllers/form.js';
import { ListController } from './controllers/list.js';
import { OverviewController } from './controllers/overview.js';

import { formModel } from './models/form.js';
import { listModel } from './models/list.js';

import { formView } from './views/form.js';
import { listView } from './views/list.js';
import { overviewView } from './views/overview.js';


PuerroController.store.set({
    vegetables: [],
});

const $formRoot = document.getElementById('vegetable-input');
const $listRoot = document.getElementById('vegetable-output');
const $overviewRoot = document.getElementById('vegetable-overview');

const formController = new FormController($formRoot, formModel, formView);
const listController = new ListController($listRoot, listModel, listView, false);
const overviewController = new OverviewController($overviewRoot, {}, overviewView, false);

listController.state.subscribe('selected', vegetable => formController.setVegetable(vegetable));