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

import { gql } from "apollo-server";
import type { DocumentNode } from "graphql";
import { Neo4jGraphQL } from "../../../../../src";
import { formatCypher, translateQuery, formatParams } from "../../../utils/tck-test-utils";
import { createJwtRequest } from "../../../../utils/create-jwt-request";

describe("Cypher Aggregations where node with LocalDateTime", () => {
    let typeDefs: DocumentNode;
    let neoSchema: Neo4jGraphQL;

    beforeAll(() => {
        typeDefs = gql`
            type User {
                someLocalDateTime: LocalDateTime
                someLocalDateTimeAlias: LocalDateTime @alias(property: "_someLocalDateTimeAlias")
            }

            type Post {
                content: String!
                likes: [User!]! @relationship(type: "LIKES", direction: IN)
            }
        `;

        neoSchema = new Neo4jGraphQL({
            typeDefs,
            config: { enableRegex: true },
        });
    });

    test("EQUAL", async () => {
        const query = gql`
            {
                posts(where: { likesAggregate: { node: { someLocalDateTime_EQUAL: "2003-09-14T12:00:00" } } }) {
                    content
                }
            }
        `;

        const req = createJwtRequest("secret", {});
        const result = await translateQuery(neoSchema, query, {
            req,
        });

        expect(formatCypher(result.cypher)).toMatchInlineSnapshot(`
            "MATCH (this:\`Post\`)
            CALL {
                WITH this
                MATCH (this1:\`User\`)-[this0:LIKES]->(this:\`Post\`)
                RETURN any(var2 IN collect(this1.someLocalDateTime) WHERE var2 = $param0) AS var3
            }
            WITH *
            WHERE var3 = $param1
            RETURN this { .content } AS this"
        `);

        expect(formatParams(result.params)).toMatchInlineSnapshot(`
            "{
                \\"param0\\": {
                    \\"year\\": 2003,
                    \\"month\\": 9,
                    \\"day\\": 14,
                    \\"hour\\": 12,
                    \\"minute\\": 0,
                    \\"second\\": 0,
                    \\"nanosecond\\": 0
                },
                \\"param1\\": true
            }"
        `);
    });

    test("EQUAL with alias", async () => {
        const query = gql`
            {
                posts(where: { likesAggregate: { node: { someLocalDateTimeAlias_EQUAL: "2003-09-14T12:00:00" } } }) {
                    content
                }
            }
        `;

        const req = createJwtRequest("secret", {});
        const result = await translateQuery(neoSchema, query, {
            req,
        });

        expect(formatCypher(result.cypher)).toMatchInlineSnapshot(`
            "MATCH (this:\`Post\`)
            CALL {
                WITH this
                MATCH (this1:\`User\`)-[this0:LIKES]->(this:\`Post\`)
                RETURN any(var2 IN collect(this1.someLocalDateTimeAlias) WHERE var2 = $param0) AS var3
            }
            WITH *
            WHERE var3 = $param1
            RETURN this { .content } AS this"
        `);

        expect(formatParams(result.params)).toMatchInlineSnapshot(`
            "{
                \\"param0\\": {
                    \\"year\\": 2003,
                    \\"month\\": 9,
                    \\"day\\": 14,
                    \\"hour\\": 12,
                    \\"minute\\": 0,
                    \\"second\\": 0,
                    \\"nanosecond\\": 0
                },
                \\"param1\\": true
            }"
        `);
    });

    test("GT", async () => {
        const query = gql`
            {
                posts(where: { likesAggregate: { node: { someLocalDateTime_GT: "2003-09-14T12:00:00" } } }) {
                    content
                }
            }
        `;

        const req = createJwtRequest("secret", {});
        const result = await translateQuery(neoSchema, query, {
            req,
        });

        expect(formatCypher(result.cypher)).toMatchInlineSnapshot(`
            "MATCH (this:\`Post\`)
            CALL {
                WITH this
                MATCH (this1:\`User\`)-[this0:LIKES]->(this:\`Post\`)
                RETURN any(var2 IN collect(this1.someLocalDateTime) WHERE var2 > $param0) AS var3
            }
            WITH *
            WHERE var3 = $param1
            RETURN this { .content } AS this"
        `);

        expect(formatParams(result.params)).toMatchInlineSnapshot(`
            "{
                \\"param0\\": {
                    \\"year\\": 2003,
                    \\"month\\": 9,
                    \\"day\\": 14,
                    \\"hour\\": 12,
                    \\"minute\\": 0,
                    \\"second\\": 0,
                    \\"nanosecond\\": 0
                },
                \\"param1\\": true
            }"
        `);
    });

    test("GTE", async () => {
        const query = gql`
            {
                posts(where: { likesAggregate: { node: { someLocalDateTime_GTE: "2003-09-14T12:00:00" } } }) {
                    content
                }
            }
        `;

        const req = createJwtRequest("secret", {});
        const result = await translateQuery(neoSchema, query, {
            req,
        });

        expect(formatCypher(result.cypher)).toMatchInlineSnapshot(`
            "MATCH (this:\`Post\`)
            CALL {
                WITH this
                MATCH (this1:\`User\`)-[this0:LIKES]->(this:\`Post\`)
                RETURN any(var2 IN collect(this1.someLocalDateTime) WHERE var2 >= $param0) AS var3
            }
            WITH *
            WHERE var3 = $param1
            RETURN this { .content } AS this"
        `);

        expect(formatParams(result.params)).toMatchInlineSnapshot(`
            "{
                \\"param0\\": {
                    \\"year\\": 2003,
                    \\"month\\": 9,
                    \\"day\\": 14,
                    \\"hour\\": 12,
                    \\"minute\\": 0,
                    \\"second\\": 0,
                    \\"nanosecond\\": 0
                },
                \\"param1\\": true
            }"
        `);
    });

    test("LT", async () => {
        const query = gql`
            {
                posts(where: { likesAggregate: { node: { someLocalDateTime_LT: "2003-09-14T12:00:00" } } }) {
                    content
                }
            }
        `;

        const req = createJwtRequest("secret", {});
        const result = await translateQuery(neoSchema, query, {
            req,
        });

        expect(formatCypher(result.cypher)).toMatchInlineSnapshot(`
            "MATCH (this:\`Post\`)
            CALL {
                WITH this
                MATCH (this1:\`User\`)-[this0:LIKES]->(this:\`Post\`)
                RETURN any(var2 IN collect(this1.someLocalDateTime) WHERE var2 < $param0) AS var3
            }
            WITH *
            WHERE var3 = $param1
            RETURN this { .content } AS this"
        `);

        expect(formatParams(result.params)).toMatchInlineSnapshot(`
            "{
                \\"param0\\": {
                    \\"year\\": 2003,
                    \\"month\\": 9,
                    \\"day\\": 14,
                    \\"hour\\": 12,
                    \\"minute\\": 0,
                    \\"second\\": 0,
                    \\"nanosecond\\": 0
                },
                \\"param1\\": true
            }"
        `);
    });

    test("LTE", async () => {
        const query = gql`
            {
                posts(where: { likesAggregate: { node: { someLocalDateTime_LTE: "2003-09-14T12:00:00" } } }) {
                    content
                }
            }
        `;

        const req = createJwtRequest("secret", {});
        const result = await translateQuery(neoSchema, query, {
            req,
        });

        expect(formatCypher(result.cypher)).toMatchInlineSnapshot(`
            "MATCH (this:\`Post\`)
            CALL {
                WITH this
                MATCH (this1:\`User\`)-[this0:LIKES]->(this:\`Post\`)
                RETURN any(var2 IN collect(this1.someLocalDateTime) WHERE var2 <= $param0) AS var3
            }
            WITH *
            WHERE var3 = $param1
            RETURN this { .content } AS this"
        `);

        expect(formatParams(result.params)).toMatchInlineSnapshot(`
            "{
                \\"param0\\": {
                    \\"year\\": 2003,
                    \\"month\\": 9,
                    \\"day\\": 14,
                    \\"hour\\": 12,
                    \\"minute\\": 0,
                    \\"second\\": 0,
                    \\"nanosecond\\": 0
                },
                \\"param1\\": true
            }"
        `);
    });

    test("MIN_EQUAL", async () => {
        const query = gql`
            {
                posts(where: { likesAggregate: { node: { someLocalDateTime_MIN_EQUAL: "2003-09-14T12:00:00" } } }) {
                    content
                }
            }
        `;

        const req = createJwtRequest("secret", {});
        const result = await translateQuery(neoSchema, query, {
            req,
        });

        expect(formatCypher(result.cypher)).toMatchInlineSnapshot(`
            "MATCH (this:\`Post\`)
            CALL {
                WITH this
                MATCH (this1:\`User\`)-[this0:LIKES]->(this:\`Post\`)
                RETURN min(this1.someLocalDateTime) = $param0 AS var2
            }
            WITH *
            WHERE var2 = $param1
            RETURN this { .content } AS this"
        `);

        expect(formatParams(result.params)).toMatchInlineSnapshot(`
            "{
                \\"param0\\": {
                    \\"year\\": 2003,
                    \\"month\\": 9,
                    \\"day\\": 14,
                    \\"hour\\": 12,
                    \\"minute\\": 0,
                    \\"second\\": 0,
                    \\"nanosecond\\": 0
                },
                \\"param1\\": true
            }"
        `);
    });

    test("MIN_GT", async () => {
        const query = gql`
            {
                posts(where: { likesAggregate: { node: { someLocalDateTime_MIN_GT: "2003-09-14T12:00:00" } } }) {
                    content
                }
            }
        `;

        const req = createJwtRequest("secret", {});
        const result = await translateQuery(neoSchema, query, {
            req,
        });

        expect(formatCypher(result.cypher)).toMatchInlineSnapshot(`
            "MATCH (this:\`Post\`)
            CALL {
                WITH this
                MATCH (this1:\`User\`)-[this0:LIKES]->(this:\`Post\`)
                RETURN min(this1.someLocalDateTime) > $param0 AS var2
            }
            WITH *
            WHERE var2 = $param1
            RETURN this { .content } AS this"
        `);

        expect(formatParams(result.params)).toMatchInlineSnapshot(`
            "{
                \\"param0\\": {
                    \\"year\\": 2003,
                    \\"month\\": 9,
                    \\"day\\": 14,
                    \\"hour\\": 12,
                    \\"minute\\": 0,
                    \\"second\\": 0,
                    \\"nanosecond\\": 0
                },
                \\"param1\\": true
            }"
        `);
    });

    test("MIN_GTE", async () => {
        const query = gql`
            {
                posts(where: { likesAggregate: { node: { someLocalDateTime_MIN_GTE: "2003-09-14T12:00:00" } } }) {
                    content
                }
            }
        `;

        const req = createJwtRequest("secret", {});
        const result = await translateQuery(neoSchema, query, {
            req,
        });

        expect(formatCypher(result.cypher)).toMatchInlineSnapshot(`
            "MATCH (this:\`Post\`)
            CALL {
                WITH this
                MATCH (this1:\`User\`)-[this0:LIKES]->(this:\`Post\`)
                RETURN min(this1.someLocalDateTime) >= $param0 AS var2
            }
            WITH *
            WHERE var2 = $param1
            RETURN this { .content } AS this"
        `);

        expect(formatParams(result.params)).toMatchInlineSnapshot(`
            "{
                \\"param0\\": {
                    \\"year\\": 2003,
                    \\"month\\": 9,
                    \\"day\\": 14,
                    \\"hour\\": 12,
                    \\"minute\\": 0,
                    \\"second\\": 0,
                    \\"nanosecond\\": 0
                },
                \\"param1\\": true
            }"
        `);
    });

    test("MIN_LT", async () => {
        const query = gql`
            {
                posts(where: { likesAggregate: { node: { someLocalDateTime_MIN_LT: "2003-09-14T12:00:00" } } }) {
                    content
                }
            }
        `;

        const req = createJwtRequest("secret", {});
        const result = await translateQuery(neoSchema, query, {
            req,
        });

        expect(formatCypher(result.cypher)).toMatchInlineSnapshot(`
            "MATCH (this:\`Post\`)
            CALL {
                WITH this
                MATCH (this1:\`User\`)-[this0:LIKES]->(this:\`Post\`)
                RETURN min(this1.someLocalDateTime) < $param0 AS var2
            }
            WITH *
            WHERE var2 = $param1
            RETURN this { .content } AS this"
        `);

        expect(formatParams(result.params)).toMatchInlineSnapshot(`
            "{
                \\"param0\\": {
                    \\"year\\": 2003,
                    \\"month\\": 9,
                    \\"day\\": 14,
                    \\"hour\\": 12,
                    \\"minute\\": 0,
                    \\"second\\": 0,
                    \\"nanosecond\\": 0
                },
                \\"param1\\": true
            }"
        `);
    });

    test("MIN_LTE", async () => {
        const query = gql`
            {
                posts(where: { likesAggregate: { node: { someLocalDateTime_MIN_LTE: "2003-09-14T12:00:00" } } }) {
                    content
                }
            }
        `;

        const req = createJwtRequest("secret", {});
        const result = await translateQuery(neoSchema, query, {
            req,
        });

        expect(formatCypher(result.cypher)).toMatchInlineSnapshot(`
            "MATCH (this:\`Post\`)
            CALL {
                WITH this
                MATCH (this1:\`User\`)-[this0:LIKES]->(this:\`Post\`)
                RETURN min(this1.someLocalDateTime) <= $param0 AS var2
            }
            WITH *
            WHERE var2 = $param1
            RETURN this { .content } AS this"
        `);

        expect(formatParams(result.params)).toMatchInlineSnapshot(`
            "{
                \\"param0\\": {
                    \\"year\\": 2003,
                    \\"month\\": 9,
                    \\"day\\": 14,
                    \\"hour\\": 12,
                    \\"minute\\": 0,
                    \\"second\\": 0,
                    \\"nanosecond\\": 0
                },
                \\"param1\\": true
            }"
        `);
    });

    test("MAX_EQUAL", async () => {
        const query = gql`
            {
                posts(where: { likesAggregate: { node: { someLocalDateTime_MAX_EQUAL: "2003-09-14T12:00:00" } } }) {
                    content
                }
            }
        `;

        const req = createJwtRequest("secret", {});
        const result = await translateQuery(neoSchema, query, {
            req,
        });

        expect(formatCypher(result.cypher)).toMatchInlineSnapshot(`
            "MATCH (this:\`Post\`)
            CALL {
                WITH this
                MATCH (this1:\`User\`)-[this0:LIKES]->(this:\`Post\`)
                RETURN max(this1.someLocalDateTime) = $param0 AS var2
            }
            WITH *
            WHERE var2 = $param1
            RETURN this { .content } AS this"
        `);

        expect(formatParams(result.params)).toMatchInlineSnapshot(`
            "{
                \\"param0\\": {
                    \\"year\\": 2003,
                    \\"month\\": 9,
                    \\"day\\": 14,
                    \\"hour\\": 12,
                    \\"minute\\": 0,
                    \\"second\\": 0,
                    \\"nanosecond\\": 0
                },
                \\"param1\\": true
            }"
        `);
    });

    test("MAX_GT", async () => {
        const query = gql`
            {
                posts(where: { likesAggregate: { node: { someLocalDateTime_MAX_GT: "2003-09-14T12:00:00" } } }) {
                    content
                }
            }
        `;

        const req = createJwtRequest("secret", {});
        const result = await translateQuery(neoSchema, query, {
            req,
        });

        expect(formatCypher(result.cypher)).toMatchInlineSnapshot(`
            "MATCH (this:\`Post\`)
            CALL {
                WITH this
                MATCH (this1:\`User\`)-[this0:LIKES]->(this:\`Post\`)
                RETURN max(this1.someLocalDateTime) > $param0 AS var2
            }
            WITH *
            WHERE var2 = $param1
            RETURN this { .content } AS this"
        `);

        expect(formatParams(result.params)).toMatchInlineSnapshot(`
            "{
                \\"param0\\": {
                    \\"year\\": 2003,
                    \\"month\\": 9,
                    \\"day\\": 14,
                    \\"hour\\": 12,
                    \\"minute\\": 0,
                    \\"second\\": 0,
                    \\"nanosecond\\": 0
                },
                \\"param1\\": true
            }"
        `);
    });

    test("MAX_GTE", async () => {
        const query = gql`
            {
                posts(where: { likesAggregate: { node: { someLocalDateTime_MAX_GTE: "2003-09-14T12:00:00" } } }) {
                    content
                }
            }
        `;

        const req = createJwtRequest("secret", {});
        const result = await translateQuery(neoSchema, query, {
            req,
        });

        expect(formatCypher(result.cypher)).toMatchInlineSnapshot(`
            "MATCH (this:\`Post\`)
            CALL {
                WITH this
                MATCH (this1:\`User\`)-[this0:LIKES]->(this:\`Post\`)
                RETURN max(this1.someLocalDateTime) >= $param0 AS var2
            }
            WITH *
            WHERE var2 = $param1
            RETURN this { .content } AS this"
        `);

        expect(formatParams(result.params)).toMatchInlineSnapshot(`
            "{
                \\"param0\\": {
                    \\"year\\": 2003,
                    \\"month\\": 9,
                    \\"day\\": 14,
                    \\"hour\\": 12,
                    \\"minute\\": 0,
                    \\"second\\": 0,
                    \\"nanosecond\\": 0
                },
                \\"param1\\": true
            }"
        `);
    });

    test("MAX_LT", async () => {
        const query = gql`
            {
                posts(where: { likesAggregate: { node: { someLocalDateTime_MAX_LT: "2003-09-14T12:00:00" } } }) {
                    content
                }
            }
        `;

        const req = createJwtRequest("secret", {});
        const result = await translateQuery(neoSchema, query, {
            req,
        });

        expect(formatCypher(result.cypher)).toMatchInlineSnapshot(`
            "MATCH (this:\`Post\`)
            CALL {
                WITH this
                MATCH (this1:\`User\`)-[this0:LIKES]->(this:\`Post\`)
                RETURN max(this1.someLocalDateTime) < $param0 AS var2
            }
            WITH *
            WHERE var2 = $param1
            RETURN this { .content } AS this"
        `);

        expect(formatParams(result.params)).toMatchInlineSnapshot(`
            "{
                \\"param0\\": {
                    \\"year\\": 2003,
                    \\"month\\": 9,
                    \\"day\\": 14,
                    \\"hour\\": 12,
                    \\"minute\\": 0,
                    \\"second\\": 0,
                    \\"nanosecond\\": 0
                },
                \\"param1\\": true
            }"
        `);
    });

    test("MAX_LTE", async () => {
        const query = gql`
            {
                posts(where: { likesAggregate: { node: { someLocalDateTime_MAX_LTE: "2003-09-14T12:00:00" } } }) {
                    content
                }
            }
        `;

        const req = createJwtRequest("secret", {});
        const result = await translateQuery(neoSchema, query, {
            req,
        });

        expect(formatCypher(result.cypher)).toMatchInlineSnapshot(`
            "MATCH (this:\`Post\`)
            CALL {
                WITH this
                MATCH (this1:\`User\`)-[this0:LIKES]->(this:\`Post\`)
                RETURN max(this1.someLocalDateTime) <= $param0 AS var2
            }
            WITH *
            WHERE var2 = $param1
            RETURN this { .content } AS this"
        `);

        expect(formatParams(result.params)).toMatchInlineSnapshot(`
            "{
                \\"param0\\": {
                    \\"year\\": 2003,
                    \\"month\\": 9,
                    \\"day\\": 14,
                    \\"hour\\": 12,
                    \\"minute\\": 0,
                    \\"second\\": 0,
                    \\"nanosecond\\": 0
                },
                \\"param1\\": true
            }"
        `);
    });
});
