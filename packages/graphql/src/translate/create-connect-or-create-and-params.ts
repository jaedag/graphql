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

import type { RelationField, Context, PrimitiveField } from "../types";
import { Neo4jGraphQLError, Node, Relationship } from "../classes";
import type { CallbackBucket } from "../classes/CallbackBucket";
import { createAuthAndParams } from "./create-auth-and-params";
import { AUTH_FORBIDDEN_ERROR } from "../constants";
import { asArray, omitFields } from "../utils/utils";
import * as CypherBuilder from "./cypher-builder/CypherBuilder";
import { convertToCypherParams } from "./cypher-builder/utils/convert-to-cypher-params";
import { addCallbackAndSetParamCypher } from "./utils/callback-utils";
import { findConflictingProperties } from "../utils/is-property-clash";
import { createRelEventMeta } from "./subscriptions/rel-create-event-meta";
import { filterMetaVariable } from "./subscriptions/filter-meta-variable";

type CreateOrConnectInput = {
    where?: {
        node: Record<string, any>;
    };
    onCreate?: {
        node?: Record<string, any>;
        edge?: Record<string, any>;
    };
};

export function createConnectOrCreateAndParams({
    input,
    varName,
    parentVar,
    relationField,
    refNode,
    node,
    context,
    withVars,
    callbackBucket,
}: {
    input: CreateOrConnectInput[] | CreateOrConnectInput;
    varName: string;
    parentVar: string;
    relationField: RelationField;
    refNode: Node;
    node: Node;
    context: Context;
    withVars: string[];
    callbackBucket: CallbackBucket;
}): CypherBuilder.CypherResult {
    asArray(input).forEach((connectOrCreateItem) => {
        const conflictingProperties = findConflictingProperties({
            node: refNode,
            input: connectOrCreateItem.onCreate?.node,
        });
        if (conflictingProperties.length > 0) {
            throw new Neo4jGraphQLError(
                `Conflicting modification of ${conflictingProperties.map((n) => `[[${n}]]`).join(", ")} on type ${
                    refNode.name
                }`
            );
        }
    });

    const withVarsVariables = withVars.map((name) => new CypherBuilder.NamedVariable(name));

    const statements = asArray(input).map((inputItem, index) => {
        const subqueryBaseName = `${varName}${index}`;
        const result = createConnectOrCreatePartialStatement({
            input: inputItem,
            baseName: subqueryBaseName,
            parentVar,
            relationField,
            refNode,
            node,
            context,
            callbackBucket,
            withVars,
        });
        return result;
    });

    const wrappedQueries = statements.map((statement) => {
        const countResult = new CypherBuilder.RawCypher(() => {
            if (context.subscriptionsEnabled) {
                return "meta as update_meta";
            }
            return "COUNT(*) AS _";
        });
        const returnStatement = new CypherBuilder.Return(countResult);
        const withStatement = new CypherBuilder.With(...withVarsVariables);
        const callStatement = new CypherBuilder.Call(CypherBuilder.concat(statement, returnStatement)).innerWith(
            ...withVarsVariables
        );
        const subqueryClause = CypherBuilder.concat(withStatement, callStatement);
        if (context.subscriptionsEnabled) {
            const afterCallWithStatement = new CypherBuilder.With("*", [
                new CypherBuilder.NamedVariable("update_meta"),
                "meta",
            ]);
            CypherBuilder.concat(subqueryClause, afterCallWithStatement);
        }

        return subqueryClause;
    });

    const query = CypherBuilder.concat(...wrappedQueries);

    return query.build(`${varName}_`);
}

function createConnectOrCreatePartialStatement({
    input,
    baseName,
    parentVar,
    relationField,
    refNode,
    node,
    context,
    callbackBucket,
    withVars,
}: {
    input: CreateOrConnectInput;
    baseName: string;
    parentVar: string;
    relationField: RelationField;
    refNode: Node;
    node: Node;
    context: Context;
    callbackBucket: CallbackBucket;
    withVars: string[];
}): CypherBuilder.Clause {
    const mergeQuery = mergeStatement({
        input,
        refNode,
        parentRefNode: node,
        context,
        relationField,
        parentNode: new CypherBuilder.NamedNode(parentVar),
        varName: baseName,
        callbackBucket,
        withVars,
    });

    const authQuery = createAuthStatement({
        node: refNode,
        context,
        nodeName: baseName,
    });

    if (authQuery) {
        return CypherBuilder.concat(mergeQuery, new CypherBuilder.With("*"), authQuery);
    }
    return mergeQuery;
}

function mergeStatement({
    input,
    refNode,
    parentRefNode,
    context,
    relationField,
    parentNode,
    varName,
    callbackBucket,
    withVars,
}: {
    input: CreateOrConnectInput;
    refNode: Node;
    parentRefNode: Node;
    context: Context;
    relationField: RelationField;
    parentNode: CypherBuilder.NamedNode;
    varName: string;
    callbackBucket: CallbackBucket;
    withVars: string[];
}): CypherBuilder.Clause {
    const whereNodeParameters = getCypherParameters(input.where?.node, refNode);
    const onCreateNodeParameters = getCypherParameters(input.onCreate?.node, refNode);

    const autogeneratedParams = getAutogeneratedParams(refNode);
    const node = new CypherBuilder.NamedNode(varName, {
        labels: refNode.getLabels(context),
    });

    const unsetAutogeneratedParams = omitFields(autogeneratedParams, Object.keys(whereNodeParameters));
    const callbackFields = getCallbackFields(refNode);

    const callbackParams = callbackFields
        .map((callbackField): [CypherBuilder.PropertyRef, CypherBuilder.RawCypher] | [] => {
            const varNameVariable = new CypherBuilder.NamedVariable(varName);
            return addCallbackAndSetParamCypher(
                callbackField,
                varNameVariable,
                parentNode,
                callbackBucket,
                "CREATE",
                node
            );
        })
        .filter((tuple) => tuple.length !== 0) as [CypherBuilder.PropertyRef, CypherBuilder.RawCypher][];

    const rawNodeParams = {
        ...unsetAutogeneratedParams,
        ...onCreateNodeParameters,
    };

    const onCreateParams = Object.entries(rawNodeParams).map(
        ([key, param]): [CypherBuilder.PropertyRef, CypherBuilder.Param] => {
            return [node.property(key), param];
        }
    );

    const merge = new CypherBuilder.Merge(node, whereNodeParameters).onCreate(...onCreateParams, ...callbackParams);

    const relationshipFields = context.relationships.find((x) => x.properties === relationField.properties);
    const autogeneratedRelationshipParams = relationshipFields ? getAutogeneratedParams(relationshipFields) : {};
    const rawOnCreateRelationshipParams = convertToCypherParams(input.onCreate?.edge || {});

    const rawRelationshipParams = {
        ...autogeneratedRelationshipParams,
        ...rawOnCreateRelationshipParams,
    };

    const relationship = new CypherBuilder.Relationship({
        source: relationField.direction === "IN" ? node : parentNode,
        target: relationField.direction === "IN" ? parentNode : node,
        type: relationField.type,
    });

    const onCreateRelationshipParams = Object.entries(rawRelationshipParams).map(
        ([key, param]): [CypherBuilder.PropertyRef, CypherBuilder.Param] => {
            return [relationship.property(key), param];
        }
    );

    const relationshipMerge = new CypherBuilder.Merge(relationship).onCreate(...onCreateRelationshipParams);

    // TODO:
    // improve namings
    let withClause: CypherBuilder.Clause | undefined;
    if (context.subscriptionsEnabled) {
        const [fromTypename, toTypename] =
            relationField.direction === "IN" ? [refNode.name, parentRefNode.name] : [parentRefNode.name, refNode.name];

        withClause = new CypherBuilder.RawCypher((env: CypherBuilder.Environment) => {
            const eventWithMetaStr = createRelEventMeta({
                event: "connect",
                relVariable: relationship.getCypher(env),
                fromVariable: relationship.source.getCypher(env),
                toVariable: relationship.target.getCypher(env),
                typename: relationField.type,
                fromTypename,
                toTypename,
            });
            return `WITH ${eventWithMetaStr}, ${filterMetaVariable([...withVars, varName]).join(", ")}`;
        });
    }

    return CypherBuilder.concat(merge, relationshipMerge, withClause);
}

function createAuthStatement({
    node,
    context,
    nodeName,
}: {
    node: Node;
    context: Context;
    nodeName: string;
}): CypherBuilder.Clause | undefined {
    if (!node.auth) return undefined;

    const auth = createAuthAndParams({
        entity: node,
        operations: ["CONNECT", "CREATE"],
        context,
        allow: { parentNode: node, varName: nodeName, chainStr: `${nodeName}${node.name}_allow` },
        escapeQuotes: false,
    });

    if (!auth[0]) return undefined;

    return new CypherBuilder.RawCypher(() => {
        const predicate = `NOT (${auth[0]})`;
        const message = AUTH_FORBIDDEN_ERROR;

        const cypherStr = `CALL apoc.util.validate(${predicate}, "${message}", [0])`;

        return [cypherStr, auth[1]];
    });
}

function getCallbackFields(node: Node | Relationship): PrimitiveField[] {
    const callbackFields = node.primitiveFields.filter((f) => f.callback);
    return callbackFields;
}

// Helper for compatibility reasons
function getAutogeneratedParams(node: Node | Relationship): Record<string, CypherBuilder.Param<any>> {
    const autogeneratedFields = node.primitiveFields
        .filter((f) => f.autogenerate)
        .reduce((acc, field) => {
            if (field.dbPropertyName) {
                acc[field.dbPropertyName] = new CypherBuilder.RawCypher("randomUUID()");
            }
            return acc;
        }, {});

    const autogeneratedTemporalFields = node.temporalFields
        .filter((field) => ["DateTime", "Time"].includes(field.typeMeta.name) && field.timestamps?.includes("CREATE"))
        .reduce((acc, field) => {
            if (field.dbPropertyName) {
                acc[field.dbPropertyName] = new CypherBuilder.RawCypher(`${field.typeMeta.name.toLowerCase()}()`);
            }
            return acc;
        }, {});
    return { ...autogeneratedTemporalFields, ...autogeneratedFields };
}

function getCypherParameters(
    onCreateParams: Record<string, any> = {},
    node?: Node
): Record<string, CypherBuilder.Param<any>> {
    const params = Object.entries(onCreateParams).reduce((acc, [key, value]) => {
        const nodeField = node?.constrainableFields.find((f) => f.fieldName === key);
        const nodeFieldName = nodeField?.dbPropertyName || nodeField?.fieldName;
        const fieldName = nodeFieldName || key;
        const valueOrArray = nodeField?.typeMeta.array ? asArray(value) : value;
        acc[fieldName] = valueOrArray;
        return acc;
    }, {});
    return convertToCypherParams(params);
}
