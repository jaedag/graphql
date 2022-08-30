/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Clauses
export { Match, OptionalMatch } from "./clauses/Match";
export { Create } from "./clauses/Create";
export { Merge } from "./clauses/Merge";
export { Call } from "./clauses/Call";
export { Return } from "./clauses/Return";
export { RawCypher } from "./clauses/RawCypher";
export { With } from "./clauses/With";
export { Unwind } from "./clauses/Unwind";
export { Union } from "./clauses/Union";

export { concat } from "./clauses/utils/concat";

// Expressions
export { Exists } from "./expressions/Exists";
export { Case } from "./expressions/Case";

//// Procedures
export * as db from "./expressions/procedures/db";
export * as apoc from "./expressions/procedures/apoc/apoc";

//// Lists
export { ListComprehension } from "./expressions/list/ListComprehension";
export { PatternComprehension } from "./expressions/list/PatternComprehension";

//// Map
export { MapExpr as Map } from "./expressions/map/MapExpr";

// Variables and references
export { NodeRef as Node, NamedNode } from "./variables/NodeRef";
export { RelationshipRef as Relationship } from "./variables/RelationshipRef";
export { Param, RawParam, NamedParam } from "./variables/Param";
export { NamedVariable, Variable } from "./variables/Variable";
export { CypherNull as Null } from "./variables/Null";
export { Literal } from "./variables/Literal";

export { Pattern } from "./Pattern"; // TODO: Maybe this should not be exported

// Operations
export { or, and, not } from "./expressions/operations/boolean";
export {
    eq,
    gt,
    gte,
    lt,
    lte,
    isNull,
    isNotNull,
    inOp as in,
    contains,
    startsWith,
    endsWith,
    matches,
} from "./expressions/operations/comparison";
export { plus, minus } from "./expressions/operations/math";

// Functions
export {
    coalesce,
    point,
    distance,
    pointDistance,
    cypherDatetime as datetime,
    labels,
    count,
    min,
    max,
    avg,
    sum,
} from "./expressions/functions/CypherFunction";
export * from "./expressions/functions/ListFunctions";
export { any, all, exists, single } from "./expressions/functions/PredicateFunctions";

// Types
export type { CypherResult } from "./types";
export type { PropertyRef } from "./expressions/PropertyRef";
export type { Clause } from "./clauses/Clause";
export type { CypherEnvironment as Environment } from "./Environment";
export type { Operation } from "./expressions/operations/Operation";
export type { ComparisonOp } from "./expressions/operations/comparison";
export type { BooleanOp } from "./expressions/operations/boolean";
export type { Expr, Predicate } from "./types";
export type { CypherFunction as Function } from "./expressions/functions/CypherFunction";
export type { ComprehensionExpr } from "./expressions/list/ComprehensionExpr";
export type { ProjectionColumn } from "./clauses/sub-clauses/Projection";
export type { SetParam } from "./clauses/sub-clauses/Set";
export type { PredicateFunction } from "./expressions/functions/PredicateFunctions";
export type { Order } from "./clauses/sub-clauses/OrderBy";
