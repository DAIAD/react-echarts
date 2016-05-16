--
-- Export utility to JSON
--
-- Example:
--     psql -U user daiad-web -t -q -f select-utility.sql| jq .
--

\set utility_id 1

;
CREATE TEMP VIEW clusters_1 AS
SELECT 
    r.cluster_key AS "key",
    (SELECT c1.name FROM "cluster" AS c1 WHERE c1.key = r.cluster_key) AS "name",
    array_to_json(array_agg(r)) AS "groups"
FROM 
    (SELECT 
        c.key AS "cluster_key", 
        g.key,
        g.name,
        g."size"
    FROM 
        "cluster" c INNER JOIN
        "group_cluster" cg ON (cg.cluster_id = c.id) INNER JOIN 
        "group" g ON (g.id = cg.id)
    WHERE c.utility_id = :utility_id
    ) AS r
GROUP BY r.cluster_key
;


SELECT
    row_to_json(r)
FROM
    (SELECT
        u.name,
        u.key,
        (SELECT array_to_json(array_agg(c1)) FROM clusters_1 AS c1) AS "clusters"
    FROM "utility" AS u WHERE u.id = :utility_id
    ) AS r
;
