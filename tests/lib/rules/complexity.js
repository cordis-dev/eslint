/**
 * @fileoverview Tests for updated complexity rule.
 * @author Patrick Brosset
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/complexity"),
	RuleTester = require("../../../lib/rule-tester/rule-tester");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({ languageOptions: { ecmaVersion: 2021 } });

ruleTester.run("complexity", rule, {
	valid: [
		{
			code: "function basic() { return true; }",
			options: [1],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "function letAssign() { let r = 0.07; }",
			options: [1],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "function optChainingOnMemberExpr(obj) { return obj?.prop; }",
			options: [1],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "function optionalChaininOnCallExpr(func) { return func?.(); }",
			options: [1],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "function oneIf(a) { if (a) { return true; } return false; }",
			options: [1],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "function oneIfElse(a) { if (a) { return true; } else { return false; } }",
			options: [2],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "function oneIfElseIf(a, b) { if (a) { return 1; } else if (b) { return 2; } return 0; }",
			options: [2],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "function ternary(val) { return val ? 'yes' : 'no'; }",
			options: [1],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "function nullishCoalescing(val) { return val ?? 'default'; }",
			options: [1],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "function nullishAssign(obj) { obj.val ??= 'default'; return obj; }",
			options: [1],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "function tryCatch() { try { return true; } catch(e) { return false; } }",
			options: [1],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "function defaultAssignment(b) { const [ c = '' ] = b; }",
			options: [1],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "function defaultParameterValue(b = '') { }",
			options: [1],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "function switchWithCases(val) { switch(val) { case 1: return 'one'; case 2: return 'two'; } }",
			options: [1],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "function switchWithDefault(val) { switch(val) { case 1: return 'one'; case 2: return 'two'; default: return 'other'; } }",
			options: [2],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "function logicalAssignment(obj) { obj.val ||= 'default'; return obj; }",
			options: [1],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "function sameLogicalAndSequence(a, b, c){ if(a && b && c) {}}",
			options: [2],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "function sameLogicalOrSequence(a, b, c){ if(a || b || c) {}}",
			options: [2],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "function twoRepeatingLogicalSequences(a, b, c, d, e){ if(a && b && c || d || e) {}}",
			options: [3],
			languageOptions: { ecmaVersion: 2022 },
		},
		{
			code: "function twoMixedLogicalSequences(a, b, c, d, e){ if(a && b || c && d) {}}",
			options: [4],
			languageOptions: { ecmaVersion: 2022 },
		},
	],
	invalid: [],
});
