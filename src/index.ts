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
export type AutomataSpec<
  K extends string,
  S extends {}={},
  A=StandardAction<P>,
  P={}
> = {
  [state in K]: ReducerSpec<K,S,A>
}

export interface ReducerSpec<
  K extends string,
  S extends {}={},
  A=StandardAction<P>,
  P={}
> {
  [type: string]: (Reducer<S,A,P> | K)[] | Reducer<S,A,P> | K
}

export type Reducer<S,A=StandardAction<P>,P={}> = (state: S, action: A) => S

export interface StandardAction<P> {
  type: string
  payload?: P
}

export type ActionStandardizer = <A,P={}>(action: A) => StandardAction<P>

const DEFAULT_AUTOMATA_STATE_KEY = 'state'

export default function createAutomataReducer<
  K extends string,
  S extends {}={},
  A=StandardAction<P>,
  P={}
> (
  automata: AutomataSpec<K,S,A,P>,
  init: string,
  toStandardAction?: ActionStandardizer
): Reducer<S,A,P>
export default function createAutomataReducer<
  K extends string,
  S extends {}={},
  A=StandardAction<P>,
  P={}
> (
  automata: AutomataSpec<K,S,A,P>,
  init: string,
  key: string,
  toStandardAction?: ActionStandardizer
): Reducer<S,A,P>
export default function createAutomataReducer<
  K extends string,
  S extends {}={},
  A=StandardAction<P>,
  P={}
> (
  automata: AutomataSpec<K,S,A,P>,
  init: string
): Reducer<S,A,P> {
  const key: string|ActionStandardizer = arguments[2] || DEFAULT_AUTOMATA_STATE_KEY
  if (!isString(key)) {
    return createAutomataReducer(automata, init, void 0, key)
  }
  const toStandardAction: ActionStandardizer = arguments[3] || identity
  const _automata = preprocess(automata, key)

  return function(previous = {} as S, event) {
    // debugger
    let state = previous[key]
      ? previous
      : { ...(<{}>previous), [key]: init } as S
    const { type } = toStandardAction(event)
    const reducers = _automata[state[key]][type] || []

    let i = reducers.length
    while (i--) {
      state = reducers[i](state, event)
    }
    return state
  }
}

function preprocess <
  K extends string,
  S extends {}={},
  A=StandardAction<P>,
  P={}
>(
  automata: AutomataSpec<K,S,A,P>,
  key: string
): Automata<K,S,A,P> {
  return Object.keys(automata).reduce(
    function (states, state) {
      const events = automata[state]
      states[state] = Object.keys(events).reduce(
        function (reducers, type) {
          reducers[type] = [].concat(events[type]).map(withAutomataReducer)
          return reducers
        },
        {} as { [type: string]: Reducer<S,A,P>[] }
      )
      return states
    },
    {} as Automata<K,S,A,P>
  )

  function withAutomataReducer (reducer: K|Reducer<S,A,P>): Reducer<S,A,P> {
    return !isString(reducer)
      ? reducer
      : function (state: S) {
        return state && state[key] === reducer
          ? state
          : { ...(<any>state), [key]: reducer }
      }
  }
}

type Automata<
  K extends string,
  S extends {}={},
  A=StandardAction<P>,
  P={}
> = {
  [state in K]: { [type: string]: Reducer<S,A,P>[] }
}

function isString (v: any): v is string {
  return typeof (v && v.valueOf()) === 'string'
}

function identity <V>(v: V): V {
  return v
}
