import { h } from 'preact';

export {
  view as listView
}

const view = controller =>
  h('div', {},
    h('button', { onClick: evt => controller.addVegetable() }, '+'),
    h('table', {},
      h('thead', {},
        h('tr', {},
          h('th', {}, 'Id'),
          h('th', {}, 'Name'),
          h('th', {}, 'Classification'),
          h('th', {}, 'Origin'),
          h('th', {}, 'Amount'),
        )
      ),
      h('tbody', {}, controller.model.vegetables.map(v =>
        h('tr', {
          style: 'color:' + (v.id === controller.model.selected.id ? 'red' : 'black'),
          onClick: evt => controller.selectVegetable(v)
        },
          h('td', {}, v.id),
          h('td', {}, v.name),
          h('td', {}, v.classification),
          h('td', {}, v.origin),
          h('td', {}, v.amount),
        ))
      )
    )
  )