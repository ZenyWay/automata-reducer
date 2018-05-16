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
export interface AutomataSpec<S,A=StandardAction<any>> {
  [state: string]: {
    [type: string]: (Reducer<S,A>|string)[]|(Reducer<S,A>|string)
  }
}

export interface StandardAction<P> {
  type: string
  payload?: P
}

export type Reducer<S,A=StandardAction<any>> = (state: S, action: A) => S

export type ActionStandardizer = <A,P>(action: A) => StandardAction<P>

const DEFAULT_AUTOMATA_STATE_KEY = 'state'

export default function createAutomataReducer<S extends object,A=StandardAction<any>> (
  automata: AutomataSpec<S,A>,
  init: string,
  toStandardAction?: ActionStandardizer
): Reducer<S,A>
export default function createAutomataReducer<S extends object,A=StandardAction<any>> (
  automata: AutomataSpec<S,A>,
  init: string,
  key: string,
  toStandardAction?: ActionStandardizer
): Reducer<S,A>
export default function createAutomataReducer<S extends object,A=StandardAction<any>> (
  automata: AutomataSpec<S,A>,
  init: string
): Reducer<S,A> {
  const key: string|ActionStandardizer = arguments[2] || DEFAULT_AUTOMATA_STATE_KEY
  if (!isString(key)) {
    return createAutomataReducer(automata, init, void 0, key)
  }
  const toStandardAction: ActionStandardizer = arguments[3] || identity
  const _automata = preprocess(automata, key)

  return function(previous = { [key]: init } as S, event) {
    // debugger
    const { type } = toStandardAction(event)
    const reducers = _automata[previous[key]][type] || []

    let i = reducers.length
    let state = previous
    while (i--) {
      state = reducers[i](state, event)
    }
    return state
  }
}

function preprocess <S,A>(
  automata: AutomataSpec<S,A>,
  key: string
): Automata<S,A> {
  return Object.keys(automata).reduce(
    function (states, state) {
      const events = automata[state]
      states[state] = Object.keys(events).reduce(
        function (reducers, type) {
          reducers[type] = [].concat(events[type]).map(withAutomataReducer)
          return reducers
        },
        {} as { [type: string]: Reducer<S,A>[] }
      )
      return states
    },
    {} as Automata<S,A>
  )

  function withAutomataReducer (reducer: string|Reducer<S,A>): Reducer<S,A> {
    return !isString(reducer)
      ? reducer
      : function (state: S) {
        return state && state[key] === reducer
          ? state
          : { ...(<any>state), [key]: reducer }
      }
  }
}

interface Automata<S,A=StandardAction<any>> {
  [state: string]: { [type: string]: Reducer<S,A>[] }
}

function isString (v: any): v is string {
  return typeof (v && v.valueOf()) === 'string'
}

function identity <V>(v: V): V {
  return v
}
