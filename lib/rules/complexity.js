/**
 * @fileoverview Counts the cyclomatic complexity of each function of the script. See http://en.wikipedia.org/wiki/Cyclomatic_complexity.
 * Counts the number of if, conditional, for, while, try, switch/case,
 * @author Patrick Brosset
 */

"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const astUtils = require("./utils/ast-utils");
const { upperCaseFirst } = require("../shared/string-utils");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const THRESHOLD_DEFAULT = 20;

/** @type {import('../types').Rule.RuleModule} */
module.exports = {
	meta: {
		type: "suggestion",

		defaultOptions: [THRESHOLD_DEFAULT],

		docs: {
			description:
				"Enforce a maximum cyclomatic complexity allowed in a program",
			recommended: false,
			url: "https://eslint.org/docs/latest/rules/complexity",
		},

		schema: [
			{
				oneOf: [
					{
						type: "integer",
						minimum: 0,
					},
					{
						type: "object",
						properties: {
							maximum: {
								type: "integer",
								minimum: 0,
							},
							max: {
								type: "integer",
								minimum: 0,
							},
							variant: {
								enum: ["classic", "modified"],
							},
						},
						additionalProperties: false,
					},
				],
			},
		],

		messages: {
			complex:
				"{{name}} has a complexity of {{complexity}}. Maximum allowed is {{max}}.",
		},
	},

	create(context) {
		const option = context.options[0];
		let threshold = THRESHOLD_DEFAULT;

		if (typeof option === "object") {
			if (
				Object.hasOwn(option, "maximum") ||
				Object.hasOwn(option, "max")
			) {
				threshold = option.maximum || option.max;
			}
		} else if (typeof option === "number") {
			threshold = option;
		}

		//--------------------------------------------------------------------------
		// Helpers
		//--------------------------------------------------------------------------

		// Using a stack to store complexity per code path
		const complexities = [];

		/**
		 * Increase the complexity of the code path in context
		 * @returns {void}
		 * @private
		 */
		function increaseComplexity() {
			complexities[complexities.length - 1]++;
		}

		/**
		 * Checks if a node has a logical expression as its parent
		 * @param {Object} node The node to check
		 * @returns {boolean} - True if the node's parent is a logical expression
		 * @private
		 */
		function hasLogicalExpressionParent(node) {
			/*
			 * In ESLint, we can check the parent via the node.parent property
			 * which is added by ESLint during traversal
			 */
			return node.parent && node.parent.type === "LogicalExpression";
		}

		/**
		 * Counts the sequences of logical operators in an expression
		 * @param {Object} node The logical expression node
		 * @param {string|null} currentOp The current operator
		 * @param {Object} sequences Object to track sequence count
		 * @returns {void}
		 * @private
		 */
		function countLogicalOperatorSequences(node, currentOp, sequences) {
			if (currentOp === null || currentOp !== node.operator) {
				sequences.count++;
			}

			if (node.left.type === "LogicalExpression") {
				countLogicalOperatorSequences(
					node.left,
					node.operator,
					sequences,
				);
			}

			if (node.right.type === "LogicalExpression") {
				countLogicalOperatorSequences(
					node.right,
					node.operator,
					sequences,
				);
			}
		}

		//--------------------------------------------------------------------------
		// Public API
		//--------------------------------------------------------------------------

		return {
			onCodePathStart() {
				// The initial complexity is 0, representing one execution path in the CodePath
				complexities.push(0);
			},

			// Each branching in the code adds 1 to the complexity
			CatchClause: increaseComplexity,
			ConditionalExpression: increaseComplexity,
			ForStatement: increaseComplexity,
			ForInStatement: increaseComplexity,
			ForOfStatement: increaseComplexity,
			IfStatement: increaseComplexity,
			WhileStatement: increaseComplexity,
			DoWhileStatement: increaseComplexity,

			SwitchStatement(node) {
				increaseComplexity();

				// Add additional complexity if there's a default case
				if (node.cases.some(caseNode => caseNode.test === null)) {
					increaseComplexity();
				}
			},

			/*
			 * Override the default handler for switch cases to NOT add complexity
			 * for regular cases, since we handle them in SwitchStatement
			 */
			"SwitchCase[test]"() {},

			LogicalExpression(node) {
				// Skip if this node is a child of another logical expression
				if (hasLogicalExpressionParent(node)) {
					return;
				}

				// Count the different operator sequences
				const sequences = { count: 0 };
				countLogicalOperatorSequences(node, null, sequences);

				// Add complexity for each sequence
				for (let i = 0; i < sequences.count; i++) {
					increaseComplexity();
				}
			},

			// Logical assignment operators have short-circuiting behavior
			AssignmentExpression(node) {
				if (astUtils.isLogicalAssignmentOperator(node.operator)) {
					increaseComplexity();
				}
			},

			onCodePathEnd(codePath, node) {
				const complexity = complexities.pop();

				/*
				 * This rule only evaluates complexity of functions, so "program" is excluded.
				 * Class field initializers and class static blocks are implicit functions. Therefore,
				 * they shouldn't contribute to the enclosing function's complexity, but their
				 * own complexity should be evaluated.
				 */
				if (
					codePath.origin !== "function" &&
					codePath.origin !== "class-field-initializer" &&
					codePath.origin !== "class-static-block"
				) {
					return;
				}

				if (threshold === 0 || complexity > threshold) {
					let name;

					if (codePath.origin === "class-field-initializer") {
						name = "class field initializer";
					} else if (codePath.origin === "class-static-block") {
						name = "class static block";
					} else {
						name = astUtils.getFunctionNameWithKind(node);
					}

					context.report({
						node,
						messageId: "complex",
						data: {
							name: upperCaseFirst(name),
							complexity,
							max: threshold,
						},
					});
				}
			},
		};
	},
};
