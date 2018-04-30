# automata-reducer
[![NPM](https://nodei.co/npm/automata-reducer.png?compact=true)](https://nodei.co/npm/automata-reducer/)

a finite-state-machine that switches reducers.

# example
see this example in [this directory](./example/index.ts).
run this example [in your browser](https://cdn.rawgit.com/ZenyWay/automata-reducer/v1.0.0/example/index.html).

```ts
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
```
see another example in [component-from-stream-redux-epic-operator](https://npmjs.com/package/component-from-stream-redux-epic-operator/#example).

# API
```ts
export default function createAutomataReducer<S extends object, A = StandardAction<any>>(
  automata: AutomataSpec<S, A>,
  init: string,
  toStandardAction?: ActionStandardizer
): Reducer<S, A>
export default function createAutomataReducer<S extends object, A = StandardAction<any>>(
  automata: AutomataSpec<S, A>,
  init: string,
  key: string,
  toStandardAction?: ActionStandardizer
): Reducer<S, A>

export interface AutomataSpec<S, A = StandardAction<any>> {
  [state: string]: {
    [type: string]: (Reducer<S, A> | string)[] | (Reducer<S, A> | string)
  }
}

export interface StandardAction<P> {
    type: string
    payload?: P
}

export declare type Reducer<S, A = StandardAction<any>> =
  (state: Partial<S>, action: A) => Partial<S>

export declare type ActionStandardizer = <A, P>(action: A) => StandardAction<P>
```
for a detailed specification of this API,
run the [unit tests](https://cdn.rawgit.com/ZenyWay/automata-reducer/v1.0.0/spec/web/index.html)
in your browser.

# TypeScript
although this library is written in [TypeScript](https://www.typescriptlang.org),
it may also be imported into plain JavaScript code:
modern code editors will still benefit from the available type definition,
e.g. for helpful code completion.

# License
Copyright 2018 Stéphane M. Catala

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the [License](./LICENSE) for the specific language governing permissions and
Limitations under the License.