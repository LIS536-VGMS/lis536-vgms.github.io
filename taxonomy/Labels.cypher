PREFIX skos:<http://www.w3.org/2004/02/skos/core#>
SELECT ?prefLabel ?altLabel ?scopeNote
WHERE
{
?s skos:prefLabel ?prefLabel .
?s skos:altLabel ?altLabel .
?s skos:scopeNote ?scopeNote .
 } LIMIT 50 OFFSET 0