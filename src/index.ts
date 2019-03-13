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
export type AutomataSpec<
  X extends string | number,
  S = any, // reducer state
  T extends string = string,
  P = any,
  A = StandardAction<T, P>
> = { [state in X]: ReducerSpec<X, S, T, P, A> }

export interface ReducerSpec<
  X extends string | number,
  S = any,
  T extends string = string,
  P = any,
  A = StandardAction<T, P>
> {
  [type: string]: (Reducer<S, T, P, A> | X)[] | Reducer<S, T, P, A> | X
}

export type Reducer<
  S,
  T extends string = string,
  P = any,
  A = StandardAction<T, P>
> = (state?: S, action?: A) => S

export interface StandardAction<T extends string = string, P = any> {
  type: T
  payload?: P
}

export interface AutomataReducerOptions<
  X extends string | number = string,
  K extends string | number = 'state',
  I extends { [key in K]: X } = { [key in K]: X },
  O = I,
  T extends string = string,
  P = any
> {
  key: K
  toStandardAction: ActionStandardizer<T, P>
  operator: Operator<I, O>
}

export type ActionStandardizer<T extends string = string, P = any> = <A>(
  action: A
) => StandardAction<T, P>

export type Operator<I = {}, O = I> = (
  fn: (i: I, ...args: any[]) => I
) => (o: O, ...args: any[]) => O

const AUTOMATA_REDUCER_DEFAULTS: Partial<
  AutomataReducerOptions<string, any, any, any, any>
> = {
  key: 'state',
  toStandardAction: identity as ActionStandardizer<any>,
  operator: identity as Operator<any, any>
}

export default function createAutomataReducer<
  X extends string | number, // AutomataState
  K extends string | number = 'state', // key in S of AutomataState prop
  I extends { [key in K]: X } = { [key in K]: X }, // inner state, on which the automata operates
  O = I, // outer state, on which the returned reducer operates
  T extends string = string,
  P = any,
  A = StandardAction<T, P>
> (
  automata: AutomataSpec<X, I, T, P, A>,
  init: X,
  opts?: Partial<AutomataReducerOptions<X, K, I, O, T, P>> | string
): Reducer<O, T, P, A> {
  if (isStringOrNumber(opts)) {
    return createAutomataReducer(automata, init, { key: opts })
  }
  const { key, toStandardAction, operator } = {
    ...(AUTOMATA_REDUCER_DEFAULTS as Partial<
      AutomataReducerOptions<X, K, I, O, T, P>
    >),
    ...opts
  }
  const withDefaultAutomataState = withDefaultEntry(key, init)
  const withDefaultState = operator(withDefaultAutomataState)
  const _automata = preprocess(
    automata,
    key,
    withDefaultAutomataState,
    operator
  )

  return function (previous?: O, event?: A): O {
    const { type } = toStandardAction(event) || ({} as StandardAction<T, P>)
    const reducer = _automata[type] || withDefaultState
    return reducer(previous, event)
  }
}

function preprocess<
  X extends string | number,
  K extends string | number,
  I extends { [key in K]: X } = { [key in K]: X },
  O = I,
  T extends string = string,
  P = any,
  A = StandardAction<T, P>
> (
  spec: AutomataSpec<X, I, T, P, A>,
  key: K,
  withDefaultAutomataState: Reducer<I, T, P, A>,
  operator: Operator<I, O>
): AutomataReducerMap<O, T, P, A> {
  const _automata = Object.keys(spec).reduce(
    function (automata: Automata<X, K, I, T, P, A>, state: string) {
      const events: ReducerSpec<X, I, T, P, A> = spec[state]
      return Object.keys(events).reduce(function (
        automata: Automata<X, K, I, T, P, A>,
        type: string
      ) {
        const reducers = ([] as (X | Reducer<I, T, P, A>)[])
          .concat(events[type])
          .map(withAutomataStateReducer)
        automata[type] = Object.assign(
          {} as { [state in K]: Reducer<O, T, P, A>[] },
          automata[type],
          { [state]: reducers }
        )
        return automata
      },
      automata)
    },
    {} as Automata<X, K, I, T, P, A>
  )

  return Object.keys(_automata).reduce(
    function (
      eventTypeToReducerMap: AutomataReducerMap<O, T, P, A>,
      type: string
    ) {
      const stateToReducersMap = _automata[type]
      eventTypeToReducerMap[type] = operator(reducer)
      return eventTypeToReducerMap

      function reducer (previous = {} as I, event = {} as A): I {
        let state = withDefaultAutomataState(previous)
        const reducers: Reducer<I, T, P, A>[] = stateToReducersMap[state[key]]
        if (reducers) {
          let i = reducers.length
          while (i--) {
            state = reducers[i](state, event)
          }
        }
        return state
      }
    },
    {} as AutomataReducerMap<O, T, P, A>
  )

  function withAutomataStateReducer (
    reducer: X | Reducer<I, T, P, A>
  ): Reducer<I, T, P, A> {
    return !isStringOrNumber(reducer)
      ? reducer
      : function (state: I) {
          return state && state[key] === reducer
            ? state
            : { ...(<any>state), [key]: reducer }
        }
  }
}

type Automata<
  X extends string | number,
  K extends string | number,
  S extends { [key in K]: X } = { [key in K]: X },
  T extends string = string,
  P = any,
  A = StandardAction<T, P>
> = {
  [type: string]: { [state in X]: Reducer<S, T, P, A>[] }
}

type AutomataReducerMap<
  S,
  T extends string = string,
  P = any,
  A = StandardAction<T, P>
> = {
  [type: string]: Reducer<S, T, P, A>
}

function withDefaultEntry<K extends string | number> (
  key: K,
  value: string | number
) {
  return function<S extends { [key in K]: any } = { [key in K]: any }> (
    map = {} as Partial<S>
  ) {
    return (map[key] ? map : { ...(map as {}), [key]: value }) as S
  }
}

function isStringOrNumber (val: any): val is string | number {
  const t = typeof (val && val.valueOf())
  return t === 'string' || t === 'number'
}

function identity<V> (v: V): V {
  return v
}
