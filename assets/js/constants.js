export { vegetableClassifications, origins };

const vegetableClassifications = [
  '',
  'Bulbs',
  'Flowers',
  'Fruits',
  'Fungi',
  'Leaves',
  'Roots',
  'Seeds',
  'Stems',
  'Tubers',
];

const origins = [
  { name: 'Europe',  disabledOn: [] },
  { name: 'Asia',    disabledOn: ['Tubers'] },
  { name: 'America', disabledOn: ['Fungi'] },
];
