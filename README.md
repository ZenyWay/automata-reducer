# automata-reducer
[![NPM](https://nodei.co/npm/automata-reducer.png?compact=true)](https://nodei.co/npm/automata-reducer/)

a tiny (< 0.5kb) finite-state-machine that switches reducers.
no dependencies.

since version 3.0, an optional functional operator may be supplied to the factory.
that operator is applied to the automata reducer only for known events,
i.e. events for which a reducer or list of reducers
is defined in the automata spec.
this is useful for e.g. efficiently applying the automata reducer
through a cursor (lense): for example, to apply an automata
to a single `todo` instance in a list of `todo` instances
for relevent events only.

# example
see this example in [this directory](./example/index.ts).<br/>
run this example [in your browser](https://cdn.rawgit.com/ZenyWay/automata-reducer/v2.1.0/example/index.html).

```ts
import createAutomataReducer, { AutomataSpec, StandardAction } from 'automata-reducer'
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

function increment (value: number = 0, { payload }: StandardAction<number>) {
  return value + +payload
}

function reset (): number {
  return 0
}

const reducer = createAutomataReducer(automata, 'init')

const idle = reducer(void 0, actions.IDLE())
log('IDLE(): %O', idle) // IDLE(): {"state":"idle"}
const fourtytwo = reducer(idle, actions.INCREMENT(42))
log('INCREMENT(42): %O', fourtytwo) // INCREMENT(42): {"state":"idle","value":42}
const init = reducer(fourtytwo, actions.RESET())
log('RESET(): %O', init) // RESET(): {"state":"init","value":0}
```

# API
as demonstrated in the above example, for each automata state,
the automata spec defines a single reducer or a list of reducers
for each action (or event) relevant to that state.
* a string is replaced by a reducer of the automata's state
that sets the latter to that string.
* reducers listed in an array are executed sequentially, from right to left
(last to first).

when combined with a `propCursor` from the
[`basic-cursors`](https://npmjs.com/package/basic-cursors) module
which applies a reducer to a named property of the state object,
and only updates the state if the reducer returns a different value,
reducers can be minimized to very simple functions,
resulting in a self-documenting the automata spec,
such as in the above example.

```ts
export default function createAutomataReducer<
  K extends string,
  S extends {} = {},
  A = StandardAction<P>,
  P = {}
>(
  automata: AutomataSpec<K, S, A, P>,
  init: string,
  toStandardAction?: ActionStandardizer
): Reducer<S, A, P>
export default function createAutomataReducer<
  K extends string,
  S extends {} = {},
  A = StandardAction<P>,
  P = {}
>(
  automata: AutomataSpec<K, S, A, P>,
  init: string,
  key: string,
  toStandardAction?: ActionStandardizer
): Reducer<S, A, P>

export declare type AutomataSpec<
  K extends string,
  S extends {} = {},
  A = StandardAction<P>,
  P = {}
> = {
  [state in K]: ReducerSpec<K, S, A>
}

export interface ReducerSpec<
  K extends string,
  S extends {} = {},
  A = StandardAction<P>,
  P = {}
> {
  [type: string]: (Reducer<S, A, P> | K)[] | Reducer<S, A, P> | K
}

export declare type Reducer<S, A = StandardAction<P>, P = {}> =
  (state: S, action: A) => S

export interface StandardAction<P> {
  type: string
  payload?: P
}

export declare type ActionStandardizer =
  <A, P = {}>(action: A) => StandardAction<P>
```
for a detailed specification of this API,
run the [unit tests](https://cdn.rawgit.com/ZenyWay/automata-reducer/v2.1.0/spec/web/index.html)
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
