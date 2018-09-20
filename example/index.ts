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
import createAutomataReducer, { AutomataSpec, StandardAction } from '../'
import { propCursor } from 'basic-cursors'
import actions from './actions'
import logger from './console'
const log = logger()

interface State {
  state: AutomataState
  value: number
}

type AutomataState = 'init' | 'idle'

const inValue = propCursor('value')

const automata: AutomataSpec<AutomataState,State> = {
  init: {
    IDLE: 'idle',
    INCREMENT: [inValue(increment), 'idle']
  },
  idle: {
    RESET: ['init', inValue(reset)],
    INCREMENT: inValue(increment)
  }
}

const reducer = createAutomataReducer(automata, 'init')

const idle = reducer(void 0, actions.IDLE())
log('IDLE(): %O', idle) // IDLE(): {"state":"idle"}
const fourtytwo = reducer(idle, actions.INCREMENT(42))
log('INCREMENT(42): %O', fourtytwo) // INCREMENT(42): {"state":"idle","value":42}
const init = reducer(fourtytwo, actions.RESET())
log('RESET(): %O', init) // RESET(): {"state":"init","value":0}

function increment (value: number = 0, { payload }: StandardAction<number>) {
  return value + +payload
}

function reset (): number {
  return 0
}
