import { ResearchController } from './controllers/index';
import { initialState } from './models/index';
import { mainView } from './views/main';

new ResearchController(document.body, initialState, mainView);