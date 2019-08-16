import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'

import App from '../App'

test('App renders w/o crashing', (): void => {
  const div = document.createElement('div')
  render(<App />, div)
  unmountComponentAtNode(div)
})
