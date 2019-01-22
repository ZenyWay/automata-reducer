'use strict' /* eslint-env jasmine */
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
const createAutomataReducer = require('../').default

describe('createAutomataReducer:', function () {
  let reducer, automata, increment, reset, createActions, actions

  beforeEach(function () {
    createActions = function (actions) {
      return actions.reduce(function (actions, type) {
        actions[type] = function (payload) {
          return { type, payload }
        }
        return actions
      }, {})
    }
    actions = createActions(['IDLE', 'INCREMENT', 'RESET'])
    increment = jasmine.createSpy('increment')
    reset = jasmine.createSpy('reset')
    automata = {
      init: {
        IDLE: 'idle',
        INCREMENT: [increment, 'idle']
      },
      idle: {
        RESET: ['init', reset],
        INCREMENT: increment
      }
    }
    reducer = createAutomataReducer(automata, 'init')
  })

  it('returns a function.', function () {
    expect(reducer).toEqual(jasmine.any(Function))
  })

  describe('the returned function:', function () {
    let idle, init
    beforeEach(function () {
      idle = reducer(void 0, actions.IDLE())
      reducer(idle, actions.INCREMENT(42))
      init = reducer(idle, actions.RESET())
    })

    it('reduces automata state.', function () {
      expect(idle).toEqual({ state: 'idle' })
    })

    it('sequentially calls the specified reducers.', function () {
      expect(increment).toHaveBeenCalledWith(
        { state: 'idle' },
        { type: 'INCREMENT', payload: 42 }
      )
      expect(reset).toHaveBeenCalledWith(
        { state: 'idle' },
        { type: 'RESET', payload: void 0 }
      )
      expect(init).toEqual({ state: 'init' })
    })

    describe(
      'when its factory was called with ' +
        'an optional `key` string argument:',
      function () {
        let state
        beforeEach(function () {
          reducer = createAutomataReducer(automata, 'init', 'foo')
          state = reducer(void 0, actions.IDLE())
        })

        it('reduces automata state at that key in the state object', function () {
          expect(state).toEqual({ foo: 'idle' })
        })
      }
    )

    describe(
      'when its factory was called with ' +
        'an optional `{ key: string }` object argument:',
      function () {
        let state
        beforeEach(function () {
          reducer = createAutomataReducer(automata, 'init', { key: 'foo' })
          state = reducer(void 0, actions.IDLE())
        })

        it('reduces automata state at that key in the state object', function () {
          expect(state).toEqual({ foo: 'idle' })
        })
      }
    )
  })
})
