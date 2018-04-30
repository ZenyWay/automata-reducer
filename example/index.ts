/**
 * @license
 * Copyright 2018 Stephane M. Catala
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */
;
import createAutomataReducer, { AutomataSpec, StandardAction } from '../src/'
import actions from './actions'
import log from './console'

interface State {
  state: string
  value: number
}

const automata: AutomataSpec<State> = {
  'init': {
    IDLE: 'idle',
    INCREMENT: [increment, 'idle']
  },
  'idle': {
    RESET: ['init', reset],
    INCREMENT: increment
  }
}

const reducer = createAutomataReducer(automata, 'init')

const idle = reducer(void 0, actions.IDLE())
log('IDLE():')(idle)
const fourtytwo = reducer(idle, actions.INCREMENT(42))
log('INCREMENT(42):')(fourtytwo)
const init = reducer(fourtytwo, actions.RESET())
log('RESET():')(init)

function increment (
  state: Partial<State> = {},
  action: StandardAction<number>
): Partial<State> {
  const { value = 0 } = state
  const { payload } = action
  return { value: payload + value }
}

function reset (
  state: Partial<State>,
  action: StandardAction<void>
): Partial<State> {
  return { value: 0 }
}
