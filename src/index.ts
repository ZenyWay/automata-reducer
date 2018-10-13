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
  X extends string,
  S extends {}={}, // reducer state
  P={},
  A=StandardAction<P>
> = {
  [state in X]: ReducerSpec<X,S,P,A>
}

export interface ReducerSpec<
  X extends string,
  S extends {}={},
  P={},
  A=StandardAction<P>
> {
  [type: string]: (Reducer<S,P,A> | X)[] | Reducer<S,P,A> | X
}

export type Reducer<S,P={},A=StandardAction<P>> = (state: S, action: A) => S

export interface StandardAction<P={}> {
  type: string
  payload?: P
}

export interface AutomataReducerOptions<
  X extends string=string,
  K extends string='state',
  I extends {[key in K]: X}={[key in K]: X},
  O=I,
  P={}
> {
  key: K
  toStandardAction: ActionStandardizer<P>
  operator: Operator<I,O>
}

export type ActionStandardizer<P={}> = <A>(action: A) => StandardAction<P>

export type Operator<I={},O=I> =
  (fn: (i: I, ...args: any[]) => I) => (o: O, ...args: any[]) => O

const AUTOMATA_REDUCER_DEFAULTS: Partial<
  AutomataReducerOptions<string,any,any,any,any>
> = {
  key: 'state',
  toStandardAction: identity as ActionStandardizer<any>,
  operator: identity as Operator<any,any>
}

export default function createAutomataReducer<
  X extends string, // AutomataState
  K extends string='state', // key in S of AutomataState prop
  I extends {[key in K]: X}={[key in K]: X}, // inner state, on which the automata operates
  O=I, // outer state, on which the returned reducer operates
  P={},
  A=StandardAction<P>
> (
  automata: AutomataSpec<X,I,P,A>,
  init: X,
  opts?: Partial<AutomataReducerOptions<X,K,I,O,P>> | string
): Reducer<O,P,A> {
  if (typeof opts === 'string') {
    return createAutomataReducer(automata, init, { key: opts })
  }
  const { key, toStandardAction, operator } = {
    ...(AUTOMATA_REDUCER_DEFAULTS as Partial<AutomataReducerOptions<X,K,I,O,P>>),
    ...opts
  }
  const _automata = preprocess(automata, init, key, operator)

  return function (previous: O, event: A): O {
    const { type } = toStandardAction(event)
    const reducer = _automata[type]
    return !reducer ? previous : reducer(previous, event)
  }
}

function preprocess <
  X extends string,
  K extends string,
  I extends {[key in K]: X}={[key in K]: X},
  O=I,
  P={},
  A=StandardAction<P>
>(
  spec: AutomataSpec<X,I,P,A>,
  init: X,
  key: K,
  operator: Operator<I,O>
): ReducerMap<O,P,A> {
  const _automata = Object.keys(spec).reduce(
    function (automata: Automata<X,I,P,A>, state: X) {
      const events = spec[state]
      return Object.keys(events).reduce(
        function (automata: Automata<X,I,P,A>, type: string) {
          const reducers = ([] as (X|Reducer<I,P,A>)[])
            .concat(events[type])
            .map(withAutomataReducer)
          automata[type] = Object.assign(
            {} as { [state in K]: Reducer<O,P,A>[] },
            automata[type],
            { [state]: reducers }
          )
          return automata
        },
        automata
      )
    },
    {} as Automata<X,I,P,A>
  )

  return Object.keys(_automata).reduce(
    function (eventTypeToReducerMap: ReducerMap<O,P,A>, type: string) {
      const stateToReducersMap = _automata[type]
      eventTypeToReducerMap[type] = operator(reducer)
      return eventTypeToReducerMap

      function reducer (previous = {} as I, event= {} as A): I {
        let state = previous[key]
          ? previous
          : { ...(<{}>previous), [key]: init } as I
        const reducers: Reducer<I,P,A>[] =
          stateToReducersMap[state[key]] || ([] as Reducer<I,P,A>[])

        let i = reducers.length
        while (i--) {
          state = reducers[i](state, event)
        }
        return state
      }
    },
    {} as ReducerMap<O,P,A>
  )

  function withAutomataReducer (reducer: X|Reducer<I,P,A>): Reducer<I,P,A> {
    return !isString(reducer)
      ? reducer
      : function (state: I) {
        return state && state[key] === reducer
          ? state
          : { ...(<any>state), [key]: reducer }
      }
  }
}

type Automata<
  X extends string,
  S extends {}={},
  P={},
  A=StandardAction<P>
> = {
  [type: string]: { [state in X]: Reducer<S,P,A>[] }
}

type ReducerMap<
  S extends {}={},
  P={},
  A=StandardAction<P>
> = {
  [type: string]: Reducer<S,P,A>
}

function isString (v: any): v is string {
  return typeof (v && v.valueOf()) === 'string'
}

function identity <V>(v: V): V {
  return v
}
