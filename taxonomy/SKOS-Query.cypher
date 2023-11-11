PREFIX skos:<http://www.w3.org/2004/02/skos/core#>
SELECT DISTINCT ?Concept ?prefLabel
WHERE
{ ?Concept ?x skos:Concept .
{ ?Concept skos:prefLabel ?prefLabel . FILTER (regex(str(?prefLabel), '^a.*', 'i'))  }
} ORDER BY ?prefLabel LIMIT 50 OFFSET 0