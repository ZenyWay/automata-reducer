!(function () {
  return function t (e, n, i) {
    function o (c, u) {
      if (!n[c]) {
        if (!e[c]) {
          var a = typeof require === 'function' && require
          if (!u && a) return a(c, !0)
          if (r) return r(c, !0)
          var f = new Error("Cannot find module '" + c + "'")
          throw ((f.code = 'MODULE_NOT_FOUND'), f)
        }
        var s = (n[c] = { exports: {} })
        e[c][0].call(
          s.exports,
          function (t) {
            return o(e[c][1][t] || t)
          },
          s,
          s.exports,
          t,
          e,
          n,
          i
        )
      }
      return n[c].exports
    }
    for (
      var r = typeof require === 'function' && require, c = 0;
      c < i.length;
      c++
    )
      o(i[c])
    return o
  }
})()(
  {
    1: [
      function (t, e, n) {
        'use strict'
        Object.defineProperty(n, '__esModule', { value: !0 })
        const i = { key: 'state', toStandardAction: r, operator: r }
        function o (t) {
          return typeof (t && t.valueOf()) === 'string'
        }
        function r (t) {
          return t
        }
        n.default = function t (e, n, r) {
          if (o(r)) return t(e, n, { key: r })
          const { key: c, toStandardAction: u, operator: a } = Object.assign(
            {},
            i,
            r
          )
          const f = (function (t, e) {
            return function (n = {}) {
              return n[t] ? n : Object.assign({}, n, { [t]: e })
            }
          })(c, n)
          const s = a(f)
          const l = (function (t, e, n, i) {
            const r = Object.keys(t).reduce(function (e, n) {
              const i = t[n]
              return Object.keys(i).reduce(function (t, e) {
                const o = [].concat(i[e]).map(c)
                return (t[e] = Object.assign({}, t[e], { [n]: o })), t
              }, e)
            }, {})
            return Object.keys(r).reduce(function (t, o) {
              const c = r[o]
              return (
                (t[o] = i(function (t = {}, i = {}) {
                  let o = n(t)
                  const r = c[o[e]]
                  if (r) {
                    let t = r.length
                    for (; t--; ) o = r[t](o, i)
                  }
                  return o
                })),
                t
              )
            }, {})
            function c (t) {
              return o(t)
                ? function (n) {
                    return n && n[e] === t
                      ? n
                      : Object.assign({}, n, { [e]: t })
                  }
                : t
            }
          })(e, c, f, a)
          return function (t, e) {
            const { type: n } = u(e) || {}
            return (l[n] || s)(t, e)
          }
        }
      },
      {}
    ],
    2: [
      function (t, e, n) {
        'use strict'
        const i = t(1).default
        describe('createAutomataReducer:', function () {
          let t, e, n, o, r, c
          beforeEach(function () {
            ;(c = (r = function (t) {
              return t.reduce(function (t, e) {
                return (
                  (t[e] = function (t) {
                    return { type: e, payload: t }
                  }),
                  t
                )
              }, {})
            })(['IDLE', 'INCREMENT', 'RESET'])),
              (n = jasmine.createSpy('increment')),
              (o = jasmine.createSpy('reset')),
              (t = i(
                (e = {
                  init: { IDLE: 'idle', INCREMENT: [n, 'idle'] },
                  idle: { RESET: ['init', o], INCREMENT: n }
                }),
                'init'
              ))
          }),
            it('returns a function.', function () {
              expect(t).toEqual(jasmine.any(Function))
            }),
            describe('the returned function:', function () {
              let r, u
              beforeEach(function () {
                ;(r = t(void 0, c.IDLE())),
                  t(r, c.INCREMENT(42)),
                  (u = t(r, c.RESET()))
              }),
                it('reduces automata state.', function () {
                  expect(r).toEqual({ state: 'idle' })
                }),
                it('sequentially calls the specified reducers.', function () {
                  expect(n).toHaveBeenCalledWith(
                    { state: 'idle' },
                    { type: 'INCREMENT', payload: 42 }
                  ),
                    expect(o).toHaveBeenCalledWith(
                      { state: 'idle' },
                      { type: 'RESET', payload: void 0 }
                    ),
                    expect(u).toEqual({ state: 'init' })
                }),
                describe('when its factory was called with an optional `key` string argument:', function () {
                  let n
                  beforeEach(function () {
                    ;(t = i(e, 'init', 'foo')), (n = t(void 0, c.IDLE()))
                  }),
                    it('reduces automata state at that key in the state object', function () {
                      expect(n).toEqual({ foo: 'idle' })
                    })
                }),
                describe('when its factory was called with an optional `{ key: string }` object argument:', function () {
                  let n
                  beforeEach(function () {
                    ;(t = i(e, 'init', { key: 'foo' })),
                      (n = t(void 0, c.IDLE()))
                  }),
                    it('reduces automata state at that key in the state object', function () {
                      expect(n).toEqual({ foo: 'idle' })
                    })
                })
            })
        })
      },
      { 1: 1 }
    ]
  },
  {},
  [2]
)
