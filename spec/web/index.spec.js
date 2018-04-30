!function(){return function t(e,n,i){function r(u,c){if(!n[u]){if(!e[u]){var a="function"==typeof require&&require;if(!c&&a)return a(u,!0);if(o)return o(u,!0);var f=new Error("Cannot find module '"+u+"'");throw f.code="MODULE_NOT_FOUND",f}var s=n[u]={exports:{}};e[u][0].call(s.exports,function(t){return r(e[u][1][t]||t)},s,s.exports,t,e,n,i)}return n[u].exports}for(var o="function"==typeof require&&require,u=0;u<i.length;u++)r(i[u]);return r}}()({1:[function(t,e,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});const i="state";function r(t){return"string"==typeof(t&&t.valueOf())}function o(t){return t}n.default=function t(e,n){const u=arguments[2]||i;if(!r(u))return t(e,n,void 0,u);const c=arguments[3]||o,a=function(t,e){return Object.keys(t).reduce(function(e,i){const r=t[i];return e[i]=Object.keys(r).reduce(function(t,e){return t[e]=[].concat(r[e]).map(n),t},{}),e},{});function n(t){return r(t)?function(){return{[e]:t}}:t}}(e,u);return function(t={[u]:n},e){const{type:i}=c(e),r=a[t[u]][i]||[];let o=r.length,f=t;for(;o--;){const t=(0,r[o])(f,e);t&&(f=Object.assign({},f,t))}return f}}},{}],2:[function(t,e,n){"use strict";const i=t(1).default;describe("createAutomataReducer:",function(){let t,e,n,r,o,u;beforeEach(function(){u=(o=function(t){return t.reduce(function(t,e){return t[e]=function(t){return{type:e,payload:t}},t},{})})(["IDLE","INCREMENT","RESET"]),n=jasmine.createSpy("increment"),r=jasmine.createSpy("reset"),t=i(e={init:{IDLE:"idle",INCREMENT:[n,"idle"]},idle:{RESET:["init",r],INCREMENT:n}},"init")}),it("returns a function.",function(){expect(t).toEqual(jasmine.any(Function))}),describe("the returned function:",function(){let o,c;beforeEach(function(){o=t(void 0,u.IDLE()),t(o,u.INCREMENT(42)),c=t(o,u.RESET())}),it("reduces automata state.",function(){expect(o).toEqual({state:"idle"})}),it("sequentially calls the specified reducers.",function(){expect(n).toHaveBeenCalledWith({state:"idle"},{type:"INCREMENT",payload:42}),expect(r).toHaveBeenCalledWith({state:"idle"},{type:"RESET",payload:void 0}),expect(c).toEqual({state:"init"})}),describe("when its factory was called with an additional `key` string argument:",function(){let n;beforeEach(function(){t=i(e,"init","foo"),n=t(void 0,u.IDLE())}),it("reduces automata state at that key in the state object",function(){expect(n).toEqual({foo:"idle"})})})})})},{1:1}]},{},[2]);
