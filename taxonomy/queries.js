PoolPartySparqlUtil = function(oConfig){
    this.oConfigSchema = {};
    this.oConfigSchema["id"]="optional";
    this.oConfigSchema["sSparqlQueryInput"]="required";
    this.oConfig = oConfig;
    this.build();
}

PoolPartySparqlUtil.prototype = {
    onConfigurationError: new YAHOO.util.CustomEvent('ConfigurationError'),
    oConfig: null,
    sSparqlQueryInput: null,
    oNamespaces: {},
    aSampleQueries: [],
    queries : [],
    build: function(){
        if("object" !== typeof this.oConfig || this.oConfig == null){
            this.onConfigurationError.fire();
        } else {
            for(key in this.oConfigSchema){
                if(typeof this.oConfigSchema[key] !== "function"){
                    if(this.oConfigSchema[key]=="required"){
                        if(this.oConfig[key]!==undefined){
                            this[key] = this.oConfig[key];
                        } else {
                            this.onConfigurationError.fire();
                            return;
                        }
                    } else {
                        if(this.oConfig[key]!==undefined){ this[key] = this.oConfig[key];}
                    }
                }
            }
        }
        this.buildNamespaces();
        this.buildSampleQueries();
    },

    buildNamespaces: function(){

        this.oNamespaces["skos"] = "<http://www.w3.org/2004/02/skos/core#>";
        this.oNamespaces["rdfs"] = "<http://www.w3.org/2000/01/rdf-schema#>";
        this.oNamespaces["owl"] = "<http://www.w3.org/2002/07/owl#>";
        this.oNamespaces["rdf"] = "<http://www.w3.org/1999/02/22-rdf-syntax-ns#>";
        this.oNamespaces["dc"] = "<http://purl.org/dc/elements/1.1/>";
        this.oNamespaces["dcterms"] = "<http://purl.org/dc/terms/>";
        this.oNamespaces["swc"] = "<http://schema.semantic-web.at/skos/1.0/extension/>";
    },

    buildSampleQueries: function(){
        this.aSampleQueries[0] = "PREFIX dcterms: <http://purl.org/dc/terms/>\nPREFIX skos: <http://www.w3.org/2004/02/skos/core#>\nSELECT DISTINCT ?Concept ?prefLabel\nWHERE\n{ ?Concept ?x skos:Concept .\n{ ?Concept skos:prefLabel ?prefLabel . FILTER (regex(str(?prefLabel), '^a.*', 'i'))  }\n} ORDER BY ?prefLabel LIMIT 50 OFFSET 0";
        this.aSampleQueries[1] = "PREFIX dcterms: <http://purl.org/dc/terms/>\nPREFIX skos: <http://www.w3.org/2004/02/skos/core#>\nSELECT ?s ?p ?o\nWHERE\n{ ?s ?p ?o\n} LIMIT 50 OFFSET 0";
        this.aSampleQueries[2] = "PREFIX dcterms: <http://purl.org/dc/terms/>\nPREFIX skos: <http://www.w3.org/2004/02/skos/core#>\nSELECT ?prefLabel ?altLabel ?scopeNote\nWHERE\n{\n?s skos:prefLabel ?prefLabel .\n?s skos:altLabel ?altLabel .\n?s skos:scopeNote ?scopeNote .\n } LIMIT 50 OFFSET 0";
        this.queries.push("PREFIX skos:<http://www.w3.org/2004/02/skos/core#>\nSELECT DISTINCT ?Concept ?prefLabel\nWHERE\n{ ?Concept ?x skos:Concept .\n{ ?Concept skos:prefLabel ?prefLabel . FILTER (regex(str(?prefLabel), '^a.*', 'i'))  }\n} ORDER BY ?prefLabel LIMIT 50 OFFSET 0");
        this.queries.push("SELECT ?s ?p ?o\nWHERE\n{ ?s ?p ?o\n} LIMIT 50 OFFSET 0");
        this.queries.push("PREFIX skos:<http://www.w3.org/2004/02/skos/core#>\nSELECT ?prefLabel ?altLabel ?scopeNote\nWHERE\n{\n?s skos:prefLabel ?prefLabel .\n?s skos:altLabel ?altLabel .\n?s skos:scopeNote ?scopeNote .\n } LIMIT 50 OFFSET 0");
    },

    getNamespace: function(sPrefix){
        return this.oNamespaces[sPrefix];
    },

    getPrefix: function(sNamespace){
        for(Namespace in this.oNamespaces){
            if(typeof this.oNamespaces[Namespace]!=="function"){
                if(this.oNamespaces[Namespace]==sNamespace){
                    return Namespace;
                }
            }
        }
        return null;
    },

    insertPrefix: function(checkbox){
        var Query = document.getElementById(this.sSparqlQueryInput).value;
        var CompletePrefix = "PREFIX " + checkbox.value + ":" + this.oNamespaces[checkbox.value];
        if(checkbox.checked == true){
            document.getElementById(this.sSparqlQueryInput).value = CompletePrefix + "\n" + Query;
        } else {
            document.getElementById(this.sSparqlQueryInput).value = Query.replace(CompletePrefix + "\n","");
        }
    },

    insertSampleQuery: function(iWhichone){
        document.getElementById(this.sSparqlQueryInput).value = this.aSampleQueries[iWhichone];
    },

    samplequery: function(num) {
        dom.get("query").value = this.queries[num];
        this.validate();
    },

    setTypeGraph: function() {
        var first = true;
        dom.getElementsByClassName("graph", "option", dom.get("format"), function(el){
            if (first) {
                el.selected = true;
                first = false;
            }
            el.style.display = "block";
        });
        dom.getElementsByClassName("tuple", "option", dom.get("format"), function(el){
            el.style.display = "none";
        });
    },
    setTypeTuple: function() {
        var first = true;
        dom.getElementsByClassName("graph", "option", dom.get("format"), function(el){
            el.style.display = "none";
        });
        dom.getElementsByClassName("tuple", "option", dom.get("format"), function(el){
            if (first) {
                el.selected = true;
                first = false;
            }
            el.style.display = "block";
        });
        dom.get("format").options[0].selected =true;
    },
    setTypeBoolean: function() {
        dom.getElementsByClassName("graph", "option", dom.get("format"), function(el){
            el.style.display = "none";
        });
        dom.getElementsByClassName("tuple", "option", dom.get("format"), function(el){
            el.style.display = "none";
        });
        dom.get("format").options[0].selected =true;
    },
    query: function() {
        dom.get("sparql_container").innerHTML = "<img src='images/rel_interstitial_loading.gif' alt='Please wait'>";
        ajax.post(PPP.springPath+"/sparql",
            "query="+encodeURIComponent(dom.get("query").value),
            function(data) {
                dom.get("sparql_container").innerHTML = data.responseText;
            })
    },
    validate: function() {
        if (!dom.get("query").value)
            return;
        if (PPP.timeout) {
            window.clearTimeout(PPP.timeout);
        }
        PPP.timeout = window.setTimeout(function() {
            if (ajax.isCallInProgress(PPP.con)) {
                YAHOO.util.Connect.abort(PPP.con, {}, false);
            }
            PPP.con = ajax.post(PPP.springPath+"/sparql",
                "_parse=true&query="+encodeURIComponent(dom.get("query").value),
                function(data) {
                    var resp = YAHOO.lang.JSON.parse(data.responseText);
                    if (resp.valid) {
                        var el = dom.get("error");
                        dom.removeClass(el, "pp-validation-invalid");
                        dom.addClass(el, "pp-validation-valid");
                        el.innerHTML = "Query valid!";
                    } else {
                        var el = dom.get("error");
                        dom.removeClass(el, "pp-validation-valid");
                        dom.addClass(el, "pp-validation-invalid");
                        el.innerHTML = resp.error;
                    }
                });
        }, 1000)
    }
}