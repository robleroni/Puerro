import { mountMVC } from '../../../../src/vdom/vdom';
import { model } from './model';
import { view } from './view';
import { controller } from './controller';

mountMVC(document.querySelector('#diffing'), model, view, controller);
mountMVC(document.querySelector('#no-diffing'), model, view, controller, false);
